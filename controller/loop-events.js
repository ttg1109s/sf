/*
    controller/loop-events.js — Recurring simulation callbacks driven by TaskManager (clock tick,
    land state/pest/water ticks), plus the `environment()` snapshot builder and the `godAgriculture`
    LandDynamicData instance it feeds. godAgriculture is recreated (not mutated) whenever the hour
    changes, which is why initGodAgriculture() is exported: app.js needs to trigger the same
    "recreate" step once at boot, and can't reassign this module's internal `let` binding directly
    from the outside — only this module can reassign its own binding.
*/

import { registry } from './registry.js';
import { ConfigSys } from './config.js';
import { driver } from './driver-instance.js';
import { fb } from '../model/utils.js';
import { timer } from '../model/timer.js';
import { db } from '../model/database-instance.js';
import { LandMaster } from '../model/land-master.js';
import { LandDynamicData } from '../model/land-dynamic.js';
import { WUI } from '../viewer/compat.js';

const environment = () => {
    const weather = db.select('weather', { day: registry.system.currentDate[2] })[0] || {};
    const minTemp = fb.array.sort(weather.temperature || [15, 32]).minValue || 15;
    const maxTemp = fb.array.sort(weather.temperature || [15, 32]).maxValue || 32;

    return {
        temp: {
            cur: WUI.weatherToday[registry.system.currentDate[3]].temperature,
            min: minTemp,
            max: maxTemp,
            average: WUI.weatherToday.averageTemp || 22,
        },
        humidity: {
            rate: WUI.weatherToday[registry.system.currentDate[3]].humidity / 100 || 0.3,
            rainfall: WUI.weatherToday[registry.system.currentDate[3]].rainfall || 0,
        },
        season: {
            harvestTimeRate: ConfigSys.seasons[registry.system.season].harvestTimeRate
        }
    }
}

let godAgriculture;

export function initGodAgriculture() {
    godAgriculture = new LandDynamicData(environment());
}

export const loopEvent = {

    memory: {
        newHour: false,

    },

    clock() {
        const now = Date.now();
        const delta = timer.distance(registry.system.currentTime, now) / 1000;
        const conversion = timer.realToIngame(delta);
        const currentDate = registry.system.currentDate;

        if (currentDate[3] !== conversion.h) {
            loopEvent.memory.newHour = true;
        }

        currentDate[4] = conversion.m;
        currentDate[3] = conversion.h;

         if (currentDate[3] === conversion.h && loopEvent.memory.newHour) {
            driver.on('weatherToday');
            loopEvent.memory.newHour = false;
            initGodAgriculture();
        }

        
        if (currentDate[2] === conversion.d) {
            
        }


        if (conversion.d) currentDate[2] = conversion.d + 1;

        if (currentDate[2] >= ConfigSys.global.endDate) {
            currentDate[0] += 1;
            currentDate[2] = ConfigSys.global.startDate;
            console.log('New Year:', currentDate[0]);
        }

        const hours = currentDate[3] % 12 || 12;
        const half = currentDate[3] >= 12 ? 'PM' : 'AM';

        const data = timer.calendar(currentDate[2], 1);

        driver.on('updateSingleContent', {
            info: {
                calendar: { text: `${data.monthName}, ${data.day}` },
                calendarWeeks: { text: `${data.weekdayName}` },
                systemTime: { text: `${fb.number.prefixZero(hours)}:${fb.number.prefixZero(currentDate[4])} ${half}` }
            }
        });
    },

    land: {
        
        master: new LandMaster(),
        
        editor(index, report) {
            if (!report) return false;
            this.master.setIndex(index);
            if (report.update) {
                this.master.edit(report.update);
            }
            
            if (report.stateChanged) {
                driver.on('landStateUpdate', {
                    index: index,
                    state: report?.update?.state?.name
                });
            }
        },

        state() {

            let self = loopEvent.land;

            const total = self.master.count();

            for (let i = 0; i < total; i++) {
                self.master.setIndex(i);
                godAgriculture.read(self.master.info());
                const reportState = godAgriculture.state();
                self.editor(i, reportState);
            }
        },

        pests() {
            let self = loopEvent.land;
            const total = self.master.count();
            const index = fb.random.int(0, total - 1);
            self.master.setIndex(index);
            godAgriculture.read(self.master.info());
            const report = godAgriculture.pests();
            if (report.update) self.editor(index, report);
        },

        water() {

            let self = loopEvent.land;
            const total = self.master.count();
            for (let i = 0; i < total; i++) {
                self.master.setIndex(i);
                godAgriculture.read(self.master.info());
                const report = godAgriculture.water();
                if (report.update) self.editor(i, report);
            }
        }
    }
}
