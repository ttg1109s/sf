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

        db.table = new Map(data.database);

        Object.assign(registry.system, data.registry.system);
        Object.assign(registry.player, data.registry.player);
        Object.assign(registry.equipments, data.registry.equipments);
        // registry.control / registry.page: KHÔNG khôi phục — đây là state của phiên
        // làm việc hiện tại (đang chọn ô nào, đang mở tab nào...), luôn bắt đầu sạch.

        // currentDate/season (lịch trong game) giữ nguyên như lúc lưu — thời gian
        // trong game "dừng" khi tắt app. Nhưng currentTime (mốc quy đổi giờ thật ->
        // giờ game của loopEvent.clock()) PHẢI đặt lại = lúc resume, nếu không
        // khoảng cách "đã đóng app bao lâu" sẽ bị quy đổi thành hàng nghìn ngày
        // trong game ngay tick đầu tiên.
        registry.system.currentTime = Date.now();

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
