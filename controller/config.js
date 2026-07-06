/*
    controller/config.js — Static game-balance configuration (seasons, market update cadence,
    land layout, tool list, stock pack size, ...). Read by both model and controller layers.
*/

export const ConfigSys = {
    global: {
        startDate: 1, // 1st day of the year
        endDate: 360, // 360 days in a year
        lang: "vn", // language setting
        currency: "VND", // currency setting
        seasons: ["spring", "summer", "autumn", "winter"], // list of seasons
        seasonLength: 90, // days
    },
    seasons: {
        "spring": {
            startDate: 1, // start date of spring
            endDate: 90, // end date of spring
            harvestTimeRate: 0.6, // percent of growthTime of product
            temperature: [15, 32], // min, max,
            sun: [6, 18], // sunsine and sunset hours
            rain: {
                probability: 0.3, // probability of rain in a day
                falling: [100, 200], // min, max mm,
                expectedDays: 24, // total rain in a day
            },
        },
        "summer": {
            startDate: 91,
            endDate: 180,
            harvestTimeRate: 0.3,
            temperature: [25, 35],
            sun: [5, 18],
            rain: {
                probability: 0.7,
                falling: [200, 300],
                expectedDays: 48,
            },
        },
        "autumn": {
            startDate: 181,
            endDate: 270,
            harvestTimeRate: 0.4,
            temperature: [20, 30],
            sun: [5, 18],
            rain: {
                probability: 0.5,
                falling: [50, 150],
                expectedDays: 25,
            },
        },
        "winter": {
            startDate: 271,
            endDate: 360,
            temperature: [10, 22],
            harvestTimeRate: 0.8,
            sun: [7, 17],
            rain: {
                probability: 0.1,
                falling: [50, 100],
                expectedDays: 10,
            },
        }
    },
    marketUpdate: {
        chanceRate: 0.3, // chance to update market prices
        'fuel': {
            price: 21357,
            cycles: 'hours',
            start: [8, 3, 2] // [start, times, cycles every times]
        },
        'products': {
            cycles: 'hours',
            start: [6, 4, 2]
        },
        'logistics': {
            cycles: 'hours',
            start: [8, 2, 1]
        },
        'water': {
            price: 200,
            cycles: 'days',
            in: 15 // in months
        },
        'electricity': {
            price: 3000,
            cycles: 'days',
            in: 30,
        },
        'bank': {
            cycles: 'hours',
            start: [7, 1, 0]
        }
    },
    land: {

        slotMax: 50, // max slot of land

        types: ['Vegetable', 'Fruit', 'Grain'],

        states:  ['empty', 'plowed', 'fertilized', 'growing', 'harvestable', 'restoring'],

        tools: ['undefined', 'shovel', 'sickle', 'fertilizer', 'seed', 'watercan', 'bucket', 'pesticide'],

    },
    stock: {

        packSizeGram: 1000, // 1 pack = 1kg

    }
}
