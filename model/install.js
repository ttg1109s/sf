/*

    Install Class =====================================================================

*/

// Tăng số này mỗi khi đổi danh sách cột (createTable) của bất kỳ bảng nào bên dưới.
// reconcileSchema() dùng số này để biết save cũ có cần đồng bộ lại cột hay không.
const DB_SCHEMA_VERSION = 1;

class Install {

    // Hình dạng mặc định của 1 dòng 'land' — dùng chung cho lúc tạo game mới
    // (newGameDatabase) VÀ lúc vá field thiếu cho save cũ (reconcileSchema),
    // để không phải định nghĩa 2 lần 2 nơi dễ lệch nhau.
    #landDefaultRow() {
        return {
            type: 'Vegetable',
            state: { code: 0, name: 'empty' },
            life: 100, slot: { cur: 0, max: 50 },
            fertilizerID: null,
            fertility: { start: null, end: null, buff: null },
            water: { set: null, cur: null, max: null },
            plantID: { code: null, name: null },
            growth: { start: null, end: null, down: null },
            pest: null, yield: null
        };
    }

    // Bảng nào có hình dạng mặc định rõ ràng thì khai báo ở đây. Bảng nào không có
    // (inventory/stock/weather — mỗi dòng luôn được tạo đủ field ngay từ đầu, không
    // có field "tuỳ chọn") thì cứ để reconcileSchema() tự vá bằng null.
    #defaultRowFor(tableName) {
        const defaults = {
            land: () => this.#landDefaultRow(),
        };
        return defaults[tableName] ? defaults[tableName]() : null;
    }

    newGameDatabase() {

        
        const weatherData = new Weather({
            day: 1,
            rainChance: 0.3,
            falling: [0, 10],
            temp: [15, 25],
            sun: [6, 18]
        }).simulator();

        db.createTable('weather', [ 'season', 'averageTemp', 'rain', 'rainList', 'rainFall', 'temperature', 'humidity' ]);
        db.insert('weather', { season: 'spring', ...weatherData });

        db.createTable('land', [ 'type', 'state', 'life', 'slot', 'fertilizerID', 'fertility', 'water', 'plantID', 'growth', 'pest', 'yield' ]);
        
        for (let i = 0; i < 3; i++) {
            db.insert('land', this.#landDefaultRow());
        }

        db.createTable('inventory', [ 'itemID', 'name', 'groups', 'quantity', 'level', 'source' ]);

        const p = new LookupProduct();

        const mapItem = [
            {
                groups: 'shovel',
                id: 1, quantity: 9999,
                name: p.item('shovel', 1).name,
                level: p.item('shovel', 1)?.reqLevel ?? 1
            }, 
            {
                groups: 'sickle',
                id: 1,
                quantity: 9999,
                name: p.item('sickle', 1).name,
                level: p.item('sickle', 1)?.reqLevel ?? 1
            },
            {
                groups: 'seed',
                id: 1,
                quantity: 9999,
                name: p.item('seed', 1).name,
                level: p.item('seed', 1)?.reqLevel ?? 1
            },
            {
                groups: 'fertilizer',
                id: 1,
                quantity: 9999,
                name: p.item('fertilizer', 1).name,
                level: p.item('fertilizer', 1)?.reqLevel ?? 1
            },
            {
                groups: 'watercan',
                id: 1,
                quantity: 9999,
                name: p.item('watercan', 1).name,
                level: p.item('watercan', 1)?.reqLevel ?? 1
            },
            {
                groups: 'bucket',
                id: 1,
                quantity: 9999,
                name: p.item('bucket', 1).name,
                level: p.item('bucket', 1)?.reqLevel ?? 1
            },
            {
                groups: 'pesticide',
                id: 1,
                quantity: 9999,
                name: p.item('pesticide', 1).name,
                level: p.item('pesticide', 1)?.reqLevel ?? 1
            },
            {
                groups: 'sickle',
                id: 9,
                quantity: 999999,
                name: p.item('sickle', 9).name,
                level: p.item('sickle', 9)?.reqLevel ?? 1
            },
        ];

        for (const value of mapItem ) {
            db.insert('inventory', {
                itemID: value.id,
                name: value.name,
                groups: value.groups,
                quantity: value.quantity,
                level: value.level,
                source: 'system'
            });
        }

        db.createTable('stock', ['start', 'end', 'seed', 'group', 'quality', 'price', 'quantity']);

    }

    // Đồng bộ dữ liệu vừa khôi phục (từ save cũ, có thể thuộc schema cũ hơn) với
    // schema HIỆN TẠI (đã được tạo sẵn bởi newGameDatabase() trước khi hàm này chạy):
    // - Bảng nào không còn tồn tại trong schema hiện tại -> xoá luôn (đổi tên/gộp bảng).
    // - Bảng nào có trong schema hiện tại nhưng save cũ không có -> giữ nguyên dữ liệu
    //   mặc định vừa được newGameDatabase() seed sẵn (không đụng vào).
    // - Với các bảng có cả 2 bên: từng dòng dữ liệu cũ được vá field thiếu (theo
    //   #defaultRowFor, hoặc null nếu không có default riêng) và xoá field thừa
    //   (cột đã bị đổi tên/xoá khỏi schema).
    reconcileSchema(db) {
        for (const tableName of Array.from(db.table.keys())) {
            const columns = db.getColumns(tableName);

            if (!columns) {
                db.table.delete(tableName);
                continue;
            }

            const defaultRow = this.#defaultRowFor(tableName);
            const rows = db.table.get(tableName);

            for (const row of rows) {
                for (const column of columns) {
                    if (!(column in row)) {
                        row[column] = (defaultRow && column in defaultRow)
                            ? fb.array.clone(defaultRow[column])
                            : null;
                    }
                }
                for (const key of Object.keys(row)) {
                    if (!columns.includes(key)) {
                        delete row[key];
                    }
                }
            }
        }
    }

    saveGame(registry) {

        const idb = new IndexDB('SimpleFarmerDB', 1);

        return idb.open('playerData', 'id').then(() => {
            const playerData = {
                id: 'player1',
                schemaVersion: DB_SCHEMA_VERSION,
                registry: fb.array.clone(registry),
                database: Array.from(db.table)
            };

            return idb.save('playerData', playerData);
        }).then(() => {
            console.log('Game saved successfully.');
            return true;
        }).catch((error) => {
            console.error('Failed to save game:', error);
            return false;
        });
    }

    resumeGame() {
        return new Promise((resolve, reject) => {
            const idb = new IndexDB('SimpleFarmerDB', 1);
            idb.open('playerData', 'id').then(() => {
                idb.get('playerData', 'player1')
                    .then((data) => {
                        if (!data) {
                            reject('No saved game found.');
                            return;
                        }

                        resolve(data);
                    })
                    .catch((error) => {
                        reject(`Failed to retrieve saved game: ${error}`);
                    });
            }).catch((error) => {
                reject(`Failed to open database: ${error}`);
            });
        });
    }

}
