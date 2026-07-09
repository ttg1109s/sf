/* Vòng lặp game: đồng hồ hệ thống và cập nhật trạng thái đất ====================================== */

const loopEvent = {

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
            godAgriculture = new LandDynamicData(environment());
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

            for (i = 0; i < total; i++) {
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
            for (i = 0; i < total; i++) {
                self.master.setIndex(i);
                godAgriculture.read(self.master.info());
                const report = godAgriculture.water();
                if (report.update) self.editor(i, report);
            }
        }
    }
}
