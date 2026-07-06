/*
    viewer/compat.js — COMPAT LAYER (phase 1: build 3D visuals only, events NOT wired yet)

    controller/driver.js and controller/loop-events.js call straight into a few UI globals
    (WUI, landUI, bagUI, USU, mouse) as part of the synchronous boot chain
    (driver.on('newGame') -> loadEveryThing -> weatherToday/landLoad/bagLoad), so those
    exports must exist and work before app.js finishes booting, or the app crashes on open.

    Rule followed when writing this:
    - Pure DATA methods (no DOM touched) -> real, working implementation.
    - Presentation methods (old jQuery/DOM for the floating-window UI) -> no-ops for now,
      to be reconnected to the 3D scene/HUD (viewer/*.js) in phase 2 (event wiring).
*/

export class WeatherUI {

    constructor() {
        this.weatherToday = null;
        this.currentHour = null;
    }

    // Pure data — controller/loop-events.js's environment() reads WUI.weatherToday directly.
    receiver(data = {}) {
        this.weatherToday = data;
    }

    hours(hours) {
        this.currentHour = hours;
    }

    // Presentation — no-op for now, reconnect in phase 2.
    render() {}

}

export const WUI = new WeatherUI();

export class LandUI {

    get() {}

    toolSelected() {}

    tools() {}

    stateUpdate() {
        return true;
    }

}

export const landUI = new LandUI();

export class BagUI {

    choiceItem() {
        return true;
    }

    equipments() {}

    reload() {}

}

export const bagUI = new BagUI();

export class UpdateSingleUI {

    constructor() {}

    addField() {}

    removeField() {}

    secretary() {}

}

export const USU = new UpdateSingleUI();

// Only needs enough interface so the 'mouseClear' task (app.js, runs every 60s) doesn't throw.
export const mouse = {
    destroy() {},
    restore() {}
};
