/*
    controller/driver-instance.js — Singleton driverControl instance shared by the whole app.
    Split from driver.js on purpose: this is the only place that actually calls
    `new driverControl()`, which lets driver.js import `{ driver }` from here without evaluating
    it before the class exists (see the comment in driver.js about the circular import).
*/

import { driverControl } from './driver.js';

export const driver = new driverControl();
