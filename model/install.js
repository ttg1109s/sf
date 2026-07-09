/*

    Install Class =====================================================================

*/

class Install {
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
            db.insert('land', {
                type: 'Vegetable',
                state: { code: 0, name: 'empty' },
                life: 100, slot: { cur: 0, max: 50 },
                fertilizerID: null,
                fertility: { start: null, end: null, buff: null },
                water: { set: null, cur: null, max: null },
                plantID: { code: null, name: null },
                growth: { start: null, end: null, down: null },
                pest: null, yield: null
            });
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

    saveGame(registry) {

        const idb = new IndexDB('SimpleFarmerDB', 1);

        return idb.open('playerData', 'id').then(() => {
            const playerData = {
                id: 'player1',
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

