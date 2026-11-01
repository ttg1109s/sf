const db = new MySQL();

db.connect('localhost', 'root', '', 'test');

const install = new Install();

const driver = new driverControl();

const l = new LandMaster();

const b = new InventoryManager();

const s = new Stock();

const systemThread = new TaskManager({
    clock: {
        time: 100,
        exe: loopEvent.clock,
        mode: 'interval',
    },
    mouseClear: {
        time: 60000,
        exe: () => {
            mouse.destroy();
            mouse.restore();
        },
        mode: 'timeout'
    },
    autoSave: {
        time: 20000, // tự lưu mỗi 20 giây thật, không cần bấm nút Save
        exe: () => {
            install.saveGame(registry);
        },
        mode: 'interval',
    }
});

const mainThread = new TaskManager({
    landState: {
        time: 100,
        exe: loopEvent.land.state,
        mode: 'timeout',
    },

    landPest: {
        time: 5000,
        exe: loopEvent.land.pests,
        mode: 'timeout',
    },

    landWater: {
        time: 10000,
        exe: loopEvent.land.water,
        mode: 'timeout',
    }
});

/*
    Boot sequence: luôn tạo schema (tableColumns) + dữ liệu mặc định trước bằng
    newGameDatabase() đồng bộ như cũ, để đảm bảo mọi bảng có cột hợp lệ ngay cả
    khi resumeGame() thành công (resumeGame chỉ ghi đè DỮ LIỆU, không tạo lại schema).

    Toàn bộ quyết định resume-hay-mới nằm trong 1 khối async DUY NHẤT, và các task
    lặp (clock/landState/...) chỉ được enable SAU KHI khối này chạy xong — tránh
    trường hợp tick đầu tiên chạy trên dữ liệu mặc định rồi bị resumeGame() ghi đè
    ngay sau đó (race condition giữa tick đồng bộ và resume bất đồng bộ).
*/
(async () => {

    install.newGameDatabase();

    try {
        const data = await install.resumeGame();

        // Merge từng bảng thay vì ghi đè thẳng db.table = new Map(...):
        // nếu sau này thêm bảng mới (schema đổi), bảng đó đã được newGameDatabase()
        // seed sẵn dữ liệu mặc định ở trên — ghi đè cả Map sẽ xoá mất bảng mới đó
        // vì save cũ vốn không có. Chỉ bảng nào CÓ trong save cũ mới bị ghi đè.
        for (const [tableName, rows] of data.database) {
            db.table.set(tableName, rows);
        }

        // Save thuộc schema cũ hơn hiện tại (hoặc save từ trước khi có versioning,
        // schemaVersion === undefined) -> vá field thiếu/xoá field thừa theo đúng
        // cột hiện tại của từng bảng (đã được newGameDatabase() tạo sẵn ở trên).
        if (data.schemaVersion !== DB_SCHEMA_VERSION) {
            install.reconcileSchema(db);
            console.log(`Đã đồng bộ schema save cũ (v${data.schemaVersion}) lên schema hiện tại (v${DB_SCHEMA_VERSION}).`);
        }

        Object.assign(registry.system, data.registry.system);
        Object.assign(registry.player, data.registry.player);
        Object.assign(registry.equipments, data.registry.equipments);
        // registry.control / registry.page: KHÔNG khôi phục — đây là state của phiên
        // làm việc hiện tại (đang chọn ô nào, đang mở tab nào...), luôn bắt đầu sạch.

        // Neo mốc thời gian thực theo thời điểm trong game đã lưu.
        // Nếu chỉ đặt currentTime = Date.now(), timer.realToIngame() sẽ bắt đầu
        // lại từ ngày 1, 00:00 ở tick kế tiếp và ghi đè currentDate đã khôi phục.
        // Tính độ lệch từ đầu năm game đến ngày/giờ/phút đã lưu để game tiếp tục
        // đúng thời điểm, đồng thời không tính thời gian người chơi đóng ứng dụng.
        const savedDate = registry.system.currentDate;
        const savedGameSeconds = timer.ingameToReal({
            d: Math.max(0, Number(savedDate?.[2] ?? 1) - 1),
            h: Number(savedDate?.[3] ?? 0),
            m: Number(savedDate?.[4] ?? 0),
        });
        registry.system.currentTime = Date.now() - savedGameSeconds * 1000;

        // weatherDaysReady không nằm trong registry nên không được lưu — tính lại
        // trực tiếp từ số dòng 'weather' vừa khôi phục thay vì để mặc định 0
        // (0 vẫn đúng về mặt an toàn, chỉ gây gọi thừa 1 lần weatherLoad, nhưng
        // tính lại cho đúng invariant thay vì dựa vào việc "vô hại" đó).
        const weatherRows = db.table.get('weather') || [];
        loopEvent.memory.weatherDaysReady = weatherRows.length - 1;

        console.log('Đã khôi phục game đã lưu.');

        godAgriculture = new LandDynamicData(environment());
        driver.on('loadEveryThing');

    } catch (reason) {

        console.log('Không có game đã lưu (hoặc lỗi khôi phục), bắt đầu ván mới:', reason);

        driver.on('newGame');
        godAgriculture = new LandDynamicData(environment());
    }

    systemThread.registry();
    systemThread.multiTask(['clock', 'mouseClear', 'autoSave'], 'enabled');

    mainThread.registry();
    mainThread.multiTask(['landState', 'landPest', 'landWater'], 'enabled');

})();
