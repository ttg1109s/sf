/*
    model/install.js — One-time new-game DB schema + seed-data bootstrapper.
*/

import { db } from './database-instance.js';
import { Weather } from './weather.js';
import { LookupProduct } from './lookup-product.js';

export class Install {
    newGameDatabase() {

        
        const weatherData = new Weather({
            day: 1,
            rainChance: 0.3,
            falling: [0, 10],
            temp: [15, 25],
            sun: [6, 18]
        }).simulator();

        db.createTable('weather', [ 'season', 'averageTemp', 'rain', 'rainList', 'rainFall', 'temperature', 'humidity' ]);
        db.insert('weather', { season: 'winter', ...weatherData });

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
        db.createTable('stockPending', ['seed', 'group', 'quality', 'fertilizerID', 'price', 'grams']);

    }
}
