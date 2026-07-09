/* Lớp xử lý logic công cụ nông nghiệp ============================================================= */

class Tool {

    
    #itemID = null;
    #toolData = null;
    #landData = null;
    #action = null;
    #attr = null;
    #seasons = null;
    #count = 1;

    #report = null;

    #shovel() {

        this.#landData.slot.cur += (this.#toolData.effectivess + this.#toolData.effectivess * (this.#attr.strength * 2));
        if (this.#landData.slot.cur >= this.#landData.slot.max)
            this.#landData.slot.cur = this.#landData.slot.max;
        this.#landData.state.code = this.#landData.slot.cur < 1 ? 0 : 1;
        this.#report = {
            changePlace: 'landSlot',
            set: {
                slot: {
                    cur: this.#landData.slot.cur,
                    max: this.#landData.slot.max
                }
            },
            state: this.#landData.state.code
        }
    }

    #fertilizer() {

        let num = timer.ingameToReal(this.#toolData.live) * 1000
        num += num * this.#attr.intelligence;
        num += Date.now();

        this.#report = {
            changePlace: 'landFertility',
            set: {
                fertilizerID: this.#itemID,
                fertility: {
                    start: Date.now(),
                    end: num,
                    buff: this.#toolData.yield
                },
            },
            state: 2
        }
    }

    #seed() {

        let pest = this.#toolData.pests;
        let yields = this.#toolData.yield;
        let growingDuration = timer.ingameToReal(this.#toolData.growthTime) * 1000;

        let rateMin = 0.1;
        let rateMax = 0.5;

        if (this.#seasons && !fb.check.includes(this.#toolData.season, this.#seasons).result) {
            pest += pest * fb.random.flt(rateMin, rateMax);
            yields -= yields * fb.random.flt(rateMin, rateMax);
            growingDuration = growingDuration + (growingDuration * fb.random.flt(rateMin, rateMax));
        } else {
            pest -= pest * fb.random.flt(rateMin, rateMax);
            yields += yields * fb.random.flt(rateMin, rateMax);

        }

        growingDuration -= growingDuration * this.#attr.intelligence;

        yields += yields * this.#landData.fertility.buff;

        yields *= (this.#landData.slot.cur * 10);

        const maxWater = parseInt(fb.calc.litter(this.#landData.slot.cur, 0.1));

        let setWater = parseInt(maxWater * this.#toolData.water + fb.random.flt(0.01, 0.1));

        if (setWater >= maxWater - maxWater * 0.3) setWater -= maxWater * 0.3;

        this.#report = {
            changePlace: 'plantSeed, plantGrowth, plantDisease, plantYield, landWater',
            set: {
                plantID: {
                    code: this.#itemID,
                    name: this.#toolData.name
                },
                growth: {
                    start: Date.now(),
                    end: Date.now() + growingDuration,
                    down: this.#toolData.downLifeScore
                },
                water: {
                    max: maxWater,
                    set: setWater,
                    cur: setWater
                },
                pest: pest,
                yield: fb.number.round(yields, 0.5),
            },
            state: 3
        }

    }

    #watercan() {

        this.#landData.water.cur += this.#toolData.upWater;
        if (this.#landData.water.cur > this.#landData.water.max)
            this.#landData.water.cur = this.#landData.water.max;
        this.#report = {
            changePlace: 'landWater',
            set: {
                water: {
                    max: this.#landData.water.max,
                    set: this.#landData.water.set,
                    cur: this.#landData.water.cur
                }
            }
        }
    }

    #bucket() {

        this.#landData.water.cur -= this.#toolData.unWater;
        let lostNatural = fb.random.flt(0.01, 0.1);
        lostNatural -= lostNatural * this.#attr.dexterity;
        this.#landData.water.cur -= lostNatural;
        if (this.#landData.water.cur < 0)
            this.#landData.water.cur = 0;

        this.#report = {
            changePlace: 'landWater',
            set: {
                water: {
                    max: this.#landData.water.max,
                    set: this.#landData.water.set,
                    cur: this.#landData.water.cur
                }
            }
        }
    }

    #pesticide() {

        let downRate = this.#toolData.downLifeScore + (this.#toolData.downLifeScore * fb.random.flt(0.01, 0.1));
        downRate -= downRate * this.#attr.intelligence;


        let pest = this.#landData.pest;

        if (fb.check.inRange(this.#landData.pest, 0.001, 10)) {
            this.#landData.pest -= this.#landData.pest * this.#toolData.effectiveness;
        }
        if (this.#landData.pest < 0.001) this.#landData.pest = 0;
        if (this.#landData.pest > 5) this.#landData.pest = 5;

        this.#landData.life -= this.#landData.life * downRate;

        if (this.#landData.life <= 0.01) this.#landData.life = 0;
        this.#report = {
            changePlace: 'landLife, plantDisease, plantYield',
            set: {
                pest: this.#landData.pest,
                life: this.#landData.life,
            }
        }
    }

    #sickle() {

        let num = this.#landData.yield + this.#landData.yield * this.#toolData.effectivess;

        let lostNatural = fb.random.flt(0.01, this.#landData.growth.down);

        const performance = this.#attr.intelligence * 0.5 + this.#attr.dexterity * 0.3 + this.#attr.endurance * 0.2;

        lostNatural -= lostNatural * performance;

        num -= lostNatural;

        num = parseInt(num);

        if (num < 0) num = 0;

        this.#report = {
            changePlace: 'plantSeed, plantGrowth, plantDisease, plantYield, landWater',
            set: {
                yield: num
            },
            state: 2
        }

    }

    read(land) {
        this.#landData = land ?? false;
        return this;
    }

    hand(action) {
        this.#action = action ?? false;
        return this;
    }

    learn(itemID, itemData) {
        this.#itemID = itemID ?? 0;
        this.#toolData = itemData ?? false;
        return this;
    }

    master(attr) {
        this.#attr = attr ?? { strength: 0, dexterity: 0, intelligence: 0, endurance: 0 };
        return this;
    }

    feel(seasons) {
        this.#seasons = seasons ?? '';
        return this;
    }

    repeat(count = 1) {
        if (count < 1) count = 1;
        this.#count = count;
        return this;
    }

    work() {

        const toolMethods = {
            shovel: this.#shovel.bind(this),
            fertilizer: this.#fertilizer.bind(this),
            seed: this.#seed.bind(this),
            watercan: this.#watercan.bind(this),
            bucket: this.#bucket.bind(this),
            pesticide: this.#pesticide.bind(this),
            sickle: this.#sickle.bind(this),
        };

        if (['shovel', 'watercan', 'bucket', 'pesticide'].includes(this.#action)) {
            for (let i = 0; i < this.#count; i++) {
                toolMethods[this.#action]();
            }
        } else {
            toolMethods[this.#action]();
        }

        return fb.array.clone(this.#report);
    }

}


