/* Xử lý biến động của đất theo thời gian (sinh trưởng, sâu bệnh, nước) ============================ */

class LandDynamicData {

    constructor(environment = {}) {
        this.environment = environment;

        this.#curTemp = (this.environment?.temp?.cur.int + this.environment?.temp?.cur.dec / 100) || 0;
        this.#minTemp = this.environment?.temp?.min || 0;
        this.#maxTemp = this.environment?.temp?.max || 0;
        this.#averageTemp = this.environment?.temp?.average || 0;
        this.#humidity = this.environment?.humidity?.rate || 0;
        this.#rainFall = this.environment?.humidity?.rainfall || 0;
        this.#harvestTimeRate = this.environment?.season.harvestTimeRate || 0.8;
    }

    #curTemp;
    #minTemp;
    #maxTemp;
    #averageTemp;
    #humidity;
    #rainFall;
    #harvestTimeRate;

    read(land) {
        this.#land = land || false;
        return this;
    }

    #land = null;

    #stateLabels = {
        0: 'empty',
        1: 'plowed',
        2: 'fertilized',
        3: 'growing',
        4: 'harvestable',
        5: 'restoring'
    }

    #newStateActive = {

        destroyFertilizer: {
            fertilizerID: null,
            fertility: { start: null, end: null, buff: null }
        },

        destroyPlant: {
            plantID: { code: null, name: null },
            growth: { start: null, end: null, down: null },
            pest: null,
            yield: null,
            water: { set: null, cur: null, max: null }
        },

        restoring: () => {

            const start = Date.now();
            const end = start + timer.ingameToReal({ h: 12 }) * 1000;

            return {
                state: {
                    name: this.#stateLabels[5],
                    code: 5
                },
                life: { start: start, end: end },
                slot: {
                    cur: 0,
                    max: this.#land.slot.max
                },
                ...this.#newStateActive.destroyFertilizer,
                ...this.#newStateActive.destroyPlant
            };
        },

        fertility: () => {
            return {
                state: {
                    name: this.#stateLabels[1],
                    code: 1
                },
                ...this.#newStateActive.destroyFertilizer,
                ...this.#newStateActive.destroyPlant
            };

            return true;
        },

        growth: () => {
            let life = this.#land.life;
            life -= life * this.#land.growth.down;
            const end = Date.now() + ((this.#land.growth.end - this.#land.growth.start) * this.#harvestTimeRate);
            if (life < 0.01) life = 0;
                        
            return {
                state: {
                    name: this.#stateLabels[4],
                    code: 4
                },
                growth: {
                    start: Date.now(),
                    end: end,
                    down: this.#land.growth.down
                    },
                life: life
            }

        },

        harvest: () => {

            return {
                state: {
                    name: this.#stateLabels[2],
                    code: 2
                },
                ...this.#newStateActive.destroyPlant
            };
        },

        restored: () => {
            return {
                state: {
                    name: this.#stateLabels[0],
                    code: 0
                },
                life: 100,
            };
        }

    }

    state() {

        if (this.#land === false) return false;

        const oldState = this.#land.state.code;

        let result = {
            update: false,
            stateChanged: false
        }

        if (oldState <= 1) return result;

        const conditions = {
            restoring: {
                check: this.#land.life < 0.01 && oldState !== 5,
                active: this.#newStateActive.restoring
            },
            fertilityEnd: {
                check: this.#land.state.code >= 2  && Date.now() >= this.#land.fertility.end && oldState < 5,
                active: this.#newStateActive.fertility
            },
            growth: {
                check: this.#land.plantID.code && Date.now() >= this.#land.growth.end && oldState === 3,
                active: this.#newStateActive.growth
            },
            harvest: {
                check: this.#land.plantID.code && Date.now() >= this.#land.growth.end && oldState === 4,
                active: this.#newStateActive.harvest
            },
            restored: {
                check: oldState === 5 && Date.now() >= this.#land.life?.end,
                active: this.#newStateActive.restored
            }
        }
        for (const condition of Object.values(conditions)) {
            result.update = condition.check ? condition.active() : false;
            if (result.update) {
                break;
            }
        }

        if (oldState !== result.update?.state?.code) {
            result.stateChanged = true;
        }

        return result;

    }

    water() {

        let result = { update: false }

        if (this.#land === false) return false;

        let land = this.#land;

        if (!land.plantID.code)  return result;

        const maxRate = fb.random.flt(0.1, 0.15);
        const minRate = fb.random.flt(0.01, 0.05);
        const downRate = fb.calc.scl(land.water.cur, 0, land.water.set, minRate, maxRate);
        const upRate = fb.calc.scl(land.water.cur, land.water.set, land.water.max, minRate, maxRate);

        const safePoint = fb.calc.scl(land.water.set, 0, land.water.max, 0, 100);
        const minSafePoint = safePoint - safePoint * 0.2;
        const maxSafePoint = safePoint + safePoint * 0.2;
        const shiftPoint = fb.calc.scl(land.water.cur, 0, land.water.max, 0, 100);

        let changed = false;

        if (!fb.check.inRange(shiftPoint, minSafePoint, maxSafePoint)) {

            if (shiftPoint > safePoint) {
                land.pest += land.pest * upRate;
                
            }
                    
            if (shiftPoint < safePoint) {
                if (land.state.code === 3) {
                    land.growth.end += (land.growth.end - land.growth.start) * downRate;
                }
                if (land.state.code === 4) {
                    land.growth.end -= (land.growth.end - land.growth.start) * downRate;
                }
            }
            if (shiftPoint > safePoint + safePoint * 0.6) {
                land.fertility.end -= (land.fertility.end - land.fertility.start) * upRate;
            }

            if (shiftPoint > safePoint + safePoint * 0.8) {
               land.life -= land.life * upRate;
            }

            if (shiftPoint >= 100 || shiftPoint <= 0) {
                land.life = 0;
            }

            if (land.life < 0) land.life = 0;
            if (land.fertility.end < Date.now()) land.fertility.end = Date.now();

            changed = true;
        
        }

        if (this.#rainFall > 0) {
            land.water.cur += fb.random.int(10, this.#rainFall / 60);
            if (land.water.cur > land.water.max) land.water.cur = land.water.max;
            changed = true;
        }

        if (this.#curTemp > this.#averageTemp && this.#rainFall <= 0) {
            land.water.cur -= land.water.cur * fb.calc.scl(1 - this.#humidity, 0, 1, 0.01, 0.1);
            changed = true;
        }
        
        if (changed) {
    
            result.update = {
                life: land.life,
                water: { ...land.water },
                fertility: { ...land.fertility },
                growth: { ...land.growth }
            };

        }

        return result;

    }

    pests() {


        if (this.#humidity < 0 || this.#humidity > 1) return false;
        if (this.#minTemp >= this.#maxTemp) return false;
        if (this.#averageTemp < this.#minTemp || this.#averageTemp > this.#maxTemp) return false;

        let tempScalePoint = 0;
        if (this.#curTemp > this.#averageTemp) {
            tempScalePoint = fb.calc.scl(this.#curTemp, this.#averageTemp, this.#maxTemp, 0, 1);
        } else {
            tempScalePoint = fb.calc.scl(this.#curTemp, this.#minTemp, this.#averageTemp, 0, 1);
        }
        const humidityScalePoint = fb.calc.scl(this.#humidity, 0, 1, 0, 1);
        const tempContribution = tempScalePoint * fb.random.flt(0.05, 0.2);
        const humidityContribution = humidityScalePoint * fb.random.flt(0.05, 0.2);
        let newPestRate = (tempContribution + humidityContribution) / 2;
        if (this.#curTemp > this.#averageTemp && this.#humidity < 0.1) {
            newPestRate *= -1;
            newPestRate /= fb.random.int(1, 3);
        }
        newPestRate = this.#land.pest + newPestRate;
        if (newPestRate <= 0) newPestRate = 0.05;
        if (newPestRate > 5) newPestRate = 5;

        let result = { update: { pest: newPestRate } };

        return result;

    }

}


