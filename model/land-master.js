/*
    model/land-master.js — CMS specialization for the 'land' table (plots).
*/

import { CMS } from './cms.js';
import { fb } from './utils.js';
import { timer } from './timer.js';
import { driver } from '../controller/driver-instance.js';

export class LandMaster extends CMS {
    constructor(landIndex = -1, place = []) {
        super();
        this.index = landIndex;
        this.place = place;
        
    }

    _table = 'land';

    stateNumber = 5;

    #yieldCheck(pest = 0, maxYield  = 0) {
        if (pest < 0 || pest > 5 || maxYield < 0) {
            throw new Error("Invalid input values");
        }
        const minYield = maxYield * 0.2;
        return parseInt(fb.calc.scl(5 - pest, 0, 5, minYield, maxYield));
    }

    viewer() {

        const data = this.info() || false;
        if (data === false) return false;

        let f, s, lf;

        if (data.fertilizerID) {
            f = timer.development(data.fertility.start, data.fertility.end, false);
        }

        if (data.plantID.code) {
            s = timer.development(data.growth.start, data.growth.end);
        }

        if (typeof(data.life) === 'object') {
            lf = timer.development(data.life.start, data.life.end, false);
        }

        const schema = {
            text: {
                landType: data.type,
                landState: data.state.name,
                landLife: typeof(data.life) !== 'object' ? fb.number.truncate(data.life) : lf?.formatted,
                landSlot: `${fb.number.truncate(data.slot.cur)}/${data.slot.max} m2`,
                landFertility: data.fertilizerID === null ? '00d, 00h, 00m' : f?.formatted,
                landWater: data.plantID.code === null ? '0/0 liters' : `${fb.number.truncate(data.water.cur,0)}/${data.water.max} liters`,
                plantSeed: data.plantID.code === null ? 'N/A' : data.plantID.name,
                plantGrowth: data.plantID.code === null ? '00d, 00h, 00m' : s?.formatted,
                plantDisease: data.plantID.code === null ? `0 R%` : `${fb.number.truncate(data.pest, 3)} R%`,
                plantYield: data.plantID.code === null ? `0 gram` : `${this.#yieldCheck(data.pest, data.yield)} grams`,
            },
            percent: {
                landLife: typeof(data.life) !== 'object' ? fb.calc.percent(data.life, 100) : lf?.percent,
                landState: fb.calc.percent(data.state.code, this.stateNumber),
                landSlot: fb.calc.percent(data.slot.cur, data.slot.max),
                landFertility: data.fertilizerID === null ? 0 : f.percent,
                landWater: data.plantID.code === null ? 0 : fb.calc.percent(data.water.cur, data.water.max),
                plantGrowth: data.plantID.code === null ? 0 : s.percent,
                plantDisease: data.plantID.code === null ? 0 : fb.calc.percent(data.pest, 5),
                plantYield: data.plantID.code === null ? 0 : fb.calc.percent(this.#yieldCheck(data.pest, data.yield), data.yield),

            }
        }

        const result = {};

        const key = this.place.length > 0 ? this.place : Object.keys(schema.text);

        if (!fb.check.array(key)) {
            throw new Error('Key must be an array.');
        }

        for (let i = 0; i < key.length; i++) {
            const k = key[i];
            result[k] = { text: schema.text[k] }
            if (schema.percent[k] !== undefined)  result[k].percent = schema.percent[k];
        }

        driver.on('updateSingleContent', { info: fb.array.clone(result) });

    }

}
