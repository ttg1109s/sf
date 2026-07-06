/*
    controller/managers.js — Shared "currently selected row" singleton managers used by
    user-driven handlers in driver.js (as opposed to loop-events.js's own separate LandMaster
    instance, which iterates ALL land rows for simulation ticks — the two are intentionally
    not the same instance).
*/

import { LandMaster } from '../model/land-master.js';
import { InventoryManager } from '../model/inventory.js';
import { Stock } from '../model/stock.js';

export const l = new LandMaster();
export const b = new InventoryManager();
export const s = new Stock();
