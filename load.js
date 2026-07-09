const db = new MySQL();

db.connect('localhost', 'root', '', 'test');

const install = new Install();
install.newGameDatabase();

const driver = new driverControl();

const l = new LandMaster();

const b = new InventoryManager();

const s = new Stock();

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
})

godAgriculture = new LandDynamicData(environment());

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

systemThread.registry();
systemThread.multiTask(['clock', 'mouseClear'], 'enabled');

mainThread.registry();
mainThread.multiTask(['landState', 'landPest', 'landWater'], 'enabled');
        