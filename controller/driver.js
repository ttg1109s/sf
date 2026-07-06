/*
    controller/driver.js — Central event dispatcher (the "driver" in driver.on(eventName, payload)).
    Holds every handler as a method of a private #event table; on() looks up and calls the
    matching one. Handlers freely call `driver.on(...)` on each other (event chaining), which is
    why this module imports the shared `driver` singleton from driver-instance.js — that import
    is circular by design (driver-instance.js imports the driverControl class from this file).
    It's safe here because every use of `driver` happens inside a method body (called later),
    never at module top-level / class-field-initializer time.
*/

import { registry } from './registry.js';
import { ConfigSys } from './config.js';
import { l, b, s } from './managers.js';
import { driver } from './driver-instance.js';
import { landUI, bagUI, USU, WUI } from '../viewer/compat.js';
import { fb } from '../model/utils.js';
import { db } from '../model/database-instance.js';
import { Weather } from '../model/weather.js';
import { Farmer } from '../model/farmer.js';
import { LookupProduct } from '../model/lookup-product.js';
import { Loop } from '../model/loop.js';

export class driverControl {

    #event = {

        // User-related events
        userClickTool(payload) {
            if (registry.control.toolSelected && registry.control.toolID === payload.index) {
                registry.control.toolSelected = false;
                registry.control.toolID = 0;
                registry.control.toolName = 'undefined';
            } else {
                registry.control.toolSelected = true;
                registry.control.toolID = payload.index;
                registry.control.toolName = ConfigSys.land.tools[payload.index];
            }
            landUI.toolSelected(payload.index - 1);
        },

        userChoiceItemInBag(payload) {
            if (!b.setIndex(payload.index)) return false;

            if (registry.control.itemBagSelected && registry.control.itemBagID === payload.index) {
                registry.control.itemBagSelected = false;
                registry.control.itemBagID = null;
            } else {
                registry.control.itemBagSelected = true;
                registry.control.itemBagID = payload.index;
            }
            bagUI.choiceItem(payload.index);
        },

        userEquippedItem() {
            const index = registry.control.itemBagID;
            if (!b.setIndex(index)) return false;

            let itemData = b.info();
            if (registry.equipments[itemData.groups] !== null) return false;
            if (itemData.quantity <= 0) return false;
            if (!fb.check.includes(ConfigSys.land.tools, itemData.groups)) return false;

            if (itemData.level > registry.player.level) {
                driver.on('message', {
                    model: 'driver/userEquippedItem',
                    messCode: 100,
                });
                return false;
            }

            registry.equipments[itemData.groups] = itemData;
            b.remove();

            registry.control.itemBagID = null;
            registry.control.itemBagSelected = false;

            bagUI.equipments(itemData.groups, true);
            bagUI.choiceItem(index);

            driver.on('bagLoad');
            itemData = null;
        },

        userRemoveEquipment(payload) {
            if (registry.equipments[payload.groups] === null) {
                return false;
            }

            let dataEquip = registry.equipments[payload.groups];
            b.add(dataEquip);

            bagUI.equipments(payload.groups, false);
            registry.equipments[payload.groups] = null;

            driver.on('bagLoad');
        },

        userSelectingLand(payload) {
            if (registry.control.landID === payload.index) return false;
            if (!l.setIndex(payload.index)) return false;
            registry.control.landID = payload.index;
            registry.control.landSelected = true;

            l.viewer();

            const livestream = new Loop(100, () => {
                if (!registry.control.userFarming) {
                    l.viewer();
                }
                if (registry.control.landSelected === false) livestream.disabled();
            }, 'interval');

            livestream.enabled();
        },

        userDeselectLand(payload) {
            if (registry.control.landID !== payload.index) return false;

            setTimeout(() => {
                if (registry.control.landSelected === true) return false;

                const update = {
                    landType: {},
                    landState: {},
                    landLife: {},
                    landSlot: {},
                    landFertility: {},
                    landWater: {},
                    plantSeed: {},
                    plantGrowth: {},
                    plantDisease: {},
                    plantYield: {} 
                };

                USU.secretary(update);
            }, 500);

            registry.control.landID = null;
            registry.control.landSelected = false;
        },

        userFarmingAction(payload) {
            if (registry.control.landSelected === false) return false;
            if (registry.control.toolSelected === false) return false;
            if (registry.control.landID !== payload.index) return false;
            if (registry.control.toolName === 'undefined') return false;
            if (registry.equipments[registry.control.toolName] === null) return false;
            if (registry.control.userFarming === true) return false;
            if (!l.setIndex(registry.control.landID)) return false;

            registry.control.userFarming = true;

            const itemInfo = registry.equipments[registry.control.toolName];

            console.log('Action:', registry.control.toolName);

            const knowledge = {
                land: l.info(),
                item: {
                    id: itemInfo.itemID,
                    quantity: itemInfo.quantity,
                    info: new LookupProduct().item(itemInfo.groups, itemInfo.itemID),
                },
                season: registry.system.season,
            };

            const self = {
                energy: {
                    stamina: registry.player.stamina[0],
                    mental: registry.player.mental[0],
                },
                attr: {
                    strength: registry.player.strength,
                    intelligence: registry.player.intelligence,
                    dexterity: registry.player.dexterity,
                    endurance: registry.player.endurance,
                },
                identity: 'user',
                action: registry.control.toolName,
            };

            driver.on('callingToFarmer', { knowledge: knowledge, self: self, itemInfo: itemInfo });

            registry.control.userFarming = false;

        },

        // Land-related events
        landLoad() {
            landUI.get(
                l.load({
                    limit: [registry.page.land * 0, 5]
                })
            );
        },

        landDataUpdate(payload) {
            const { index, report, change } = payload;
            if (fb.check.type([index, report, change], 'undefined', true)) return false;

            l.setIndex(index);
            l.edit(report);
            l.changePlace = change;
            l.viewer();
        },

        landStateUpdate(payload) {
            landUI.stateUpdate(payload.index, payload.state);
        },

        // Weather-related events
        weatherLoad() {
            const seasonName = new Weather({day: registry.system.currentDate[2]}).getSeason();
            const season = ConfigSys.seasons[seasonName];

            const w = new Weather({
                rainChance: season.rain.probability,
                falling: season.rain.falling,
                temp: season.temperature,
                sun: season.sun,
            });

            const list = w.continue(10);

            for (const i in list) db.insert('weather', { season: seasonName, ...list[i] });

        },

        weatherToday() {
            const { currentDate } = registry.system;
            const [day, hour] = [currentDate[2], currentDate[3]];

            const weather = new Weather();
            let info = weather.dataSend(day, hour);

            WUI.receiver(info);
            WUI.hours(hour);
            WUI.render();
        },


        // Bag-related events
        bagLoad() {
            bagUI.reload(b.load());
        },

        userWastage(payload) {
            const { stamina, mental, item } = payload.report;
            if (!fb.check.type([stamina, mental, item], 'number', true)) return false;

            const itemEq = payload.equipments;

            registry.player.stamina[0] -= stamina;
            registry.player.mental[0] -= mental;
            registry.equipments[itemEq].quantity -= item;

            console.log(registry.equipments[itemEq].quantity);

            if (registry.player.stamina[0] < 0) registry.player.stamina[0] = 0;
            if (registry.player.mental[0] < 0) registry.player.mental[0] = 0;
            if (registry.equipments[itemEq].quantity < 0) registry.equipments[itemEq] = null;

            if (registry.equipments[itemEq] === null) {
                bagUI.equipments(itemEq, false);
                bagUI.reload(b.load());
            }
        },

        // Game-related events
        newGame() {
            registry.system.currentDate = [1, 1, 1, 0, 0];
            registry.system.season = 'spring';
            registry.system.gameStarted = true;
            registry.system.startTime = Date.now();
            registry.system.currentTime = Date.now();

            registry.player.money = 1000000;
            registry.player.debt = 0;
            registry.player.experience = [0, 100];
            registry.player.stamina = [9999, 9999];
            registry.player.mental = [9999, 9999];
            registry.player.health = 100;

            driver.on('weatherLoad');
            driver.on('loadEveryThing');
            

        },

        loadEveryThing() {
            driver.on('weatherToday');
            driver.on('landLoad');
            driver.on('bagLoad');
        },

        callingToFarmer(payload) {

            const w = new Farmer({ knowledge: payload.knowledge, self: payload.self });
            const report = w.worker();
            if (report.complete) {
                const callToDriver = {
                    place() {
                        driver.on('landDataUpdate', {
                            index: registry.control.landID,
                            report: report.update.set,
                            change: report.change.place
                        });
                    },
                    state() {
                        driver.on('landStateUpdate', {
                            index: registry.control.landID,
                            state: report.update.set.state.name
                        });
                    },
                    wastage() {
                        if (payload.self.identity === 'user') {
                            driver.on('userWastage', {
                                report: report.update.wastage,
                                equipments: payload.itemInfo.groups
                            });
                        }
                    },
                    pack() {
                        driver.on('bringToStock', {
                            seedID: report.update.pack.seedID,
                            fertilizerID: report.update.pack.fertilizerID,
                            yield: report.update.pack.yield
                        });
                    }
                }

                for (const i in report.change) {
                    if (report.change[i] && callToDriver[i] !== undefined) {
                        callToDriver[i]();
                    }

                }

            }

        },

        bringToStock(payload) {

            const p = new LookupProduct();

            const pack = {
                seed: p.item('seed', payload.seedID),
                fertilizer: p.item('fertilizer', payload.fertilizerID),
                fertilizerID: payload.fertilizerID,
                yield: payload.yield
            }

            s.revicer(pack);

        },

        showTool(payload) {
            landUI.tools(registry.control.toolName, payload.position, payload.show, payload.transform);
        },

        updateSingleContent(payload) {
            USU.secretary(payload.info);
        }
    };

    on(event, payload) {
        if (this.#event[event] === undefined) return false;
        this.#event[event](payload);
    }
}
