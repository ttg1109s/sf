/*
    controller/registry.js — Mutable live game state (system/control/player/equipments/page).
    Declared as `const` since the reference itself never changes, only its nested properties
    are mutated in place — that's exactly what all the rest of the app relies on.
*/

export const registry = {
    system: {
        gameStarted: false,
        gamePaused: false,
        startTime: 0, // timestamp
        currentTime: 0, // timestamp
        currentDate: [0, 0, 1, 0, 0], // [year, month, day, hour, minute]
        season: 'spring',
        halfDay: false,
        shiftNight: false
    },
    control: {
        landID: null,
        landSelected: false,
        landDataCache: {},
        toolID: 0,
        toolSelected: false,
        toolName: 'undefined',
        itemBagID: null,
        itemBagSelected: false,
        userFarming: false,
    },
    player: {
        level: 1,
        money: 0,
        debt: 0,
        experience: [0, 100], // [current, max]
        stamina: [9999, 9999], // [current, max]
        mental: [9999, 9999], // [current, max]
        health: 0,
        // player attributes, every level up gives 10 points to distribute among attributes
        // player can increase attributes by using specific activeities or stimulant products
        strength: 3,
        intelligence: 3,
        dexterity: 2,
        endurance: 2,
    },
    equipments: {
        shovel: null,
        sickle: null,
        fertilizer: null,
        seed: null,
        watercan: null,
        bucket: null,
        pesticide: null
    },
    page: {
        land: 0,
        bag: 0,
        stock: 0
    }
}
