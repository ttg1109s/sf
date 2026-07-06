/*
    app.js — Entry point. Boots the in-memory DB, seeds a new game, wires up the recurring
    simulation tasks, and starts them. This is the ES module replacement for the old load.js
    (kept as a script-tag include list before); everything here now resolves through imports
    instead of relying on classic-script global scope.
*/

import { Install } from './model/install.js';
import { TaskManager } from './model/task-manager.js';
import { driver } from './controller/driver-instance.js';
import { loopEvent, initGodAgriculture } from './controller/loop-events.js';
import { mouse } from './viewer/compat.js';

new Install().newGameDatabase();

driver.on('newGame');

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
    }
});

initGodAgriculture();

const mainThread = new TaskManager({
    landState: {
        time: 100,
        exe: loopEvent.land.state,
        mode: 'timeout',
    },
    landPest: {
        time: 1000,
        exe: loopEvent.land.pests,
        mode: 'timeout',
    },
    landWater: {
        time: 1000,
        exe: loopEvent.land.water,
        mode: 'timeout',
    }
});

systemThread.registry();
systemThread.multiTask(['clock', 'mouseClear'], 'enabled');

mainThread.registry();
mainThread.multiTask(['landState', 'landPest', 'landWater'], 'enabled');
