/*
    model/farmer.js — Orchestrates one farming action end-to-end (check -> prepare -> operation -> pack -> state -> wastage).
*/

import { fb } from './utils.js';
import { Tool } from './tool.js';

export class Farmer {

    constructor({ knowledge, self }) {
        this.knowledge = knowledge;
        this.self = self;

        // knowledge

        this.#land = this.knowledge.land ?? this.#land;
        this.#itemID = this.knowledge.item.id ?? this.#itemID;
        this.#itemQuantity = this.knowledge.item.quantity ?? this.#itemQuantity;
        this.#itemInfo = this.knowledge.item.info ?? this.#itemInfo;
        this.#season = this.knowledge.season ?? this.#season;

        // self
        this.#energy = this.self.energy ?? this.#energy;
        this.#attrPoints = this.self.attr ?? this.#attrPoints;
        this.#action = this.self.action ?? this.#action;
    }

    // base
    #validActions = ['shovel', 'fertilizer', 'seed', 'watercan', 'bucket', 'pesticide', 'sickle', 'none'];
    #attr = {};
    #slotInt = 0;
    #stateLabels = {
        0: 'empty',
        1: 'plowed',
        2: 'fertilized',
        3: 'growing',
        4: 'harvestable',
        5: 'restoring'
    }

    // knowledge
    #land = false;
    #itemID = 0
    #itemQuantity = 0;
    #itemInfo = false;
    #season = '';

    // self
    #energy = { stamina: 0, mental: 0 };
    #attrPoints = { strength: 0, dexterity: 0, intelligence: 0, endurance: 0 };
    #action = undefined;

    // report

    #report = {
        message: [],
        update: {
            pack: null,
            set: null,
            state: null,
            wastage: null,
        },
        change: {
            pack: false,
            place: false,
            state: false,
            wastage: false
        },
        complete: false
    }
    


    #check() {
        if (this.#itemID === 0 || this.#itemQuantity < 0)
            throw new Error('Farmer: itemID and itemQuantity must be greater than 0.');

        if (this.#land === false || Object.keys(this.#land).length === 0)
            throw new Error('Farmer: You must provide land data.');

        if (this.#land.state.code < 0 || this.#land.state.code > 5)
            throw new Error('Farmer: Land state must be between 0 and 5.');

        if (!fb.check.includes(this.#validActions, this.#action).result)
            throw new Error(`Farmer: Action must be one of the following: ${this.#validActions.join(', ')}.`);

        if (!fb.check.type(this.#attrPoints, 'object') || fb.check.array(this.#attrPoints) === true)
            throw new Error('Farmer: Attr must be a valid object.');
        
        const attrKeys = ['strength', 'dexterity', 'intelligence', 'endurance'];
        if (fb.check.includes(Object.keys(this.#attrPoints), attrKeys).result === false)
            throw new Error(`Farmer: Attr must contain the following keys: ${attrKeys.join(', ')}.`);

        if (!fb.check.type(this.#energy, 'object') || fb.check.array(this.#energy) === true)
            throw new Error('Farmer: Energy must be a valid object.');

        const energyKeys = ['stamina', 'mental'];
        if (fb.check.includes(Object.keys(this.#energy), energyKeys).result === false)
            throw new Error(`Farmer: Energy must contain the following keys: ${energyKeys.join(', ')}.`);

        if (this.#land.slot.cur < 1 && this.#action === 'fertilizer') {
            this.#report.message.push({ modelSend: 'farmer/check', messCode: 2 });
            return false;
        }

        if (this.#land.plantID.code && this.#action === 'pesticide' && !fb.check.inRange(this.#land.pest, 0, 5, false)) {
            this.#report.message.push({ modelSend: 'farmer/check', messCode: this.#land.pest === 0 ? 3 : 4 });
            return false;
        }

        if (this.#land.life <= 0) {
            this.#report.message.push({ modelSend: 'farmer/check', messCode: 5 });
            return false;
        }

        const bypassActions = {
            0: 'shovel',
            1: 'shovel,fertilizer',
            2: 'seed',
            3: 'watercan,bucket,pesticide',
            4: 'sickle,watercan,bucket,pesticide',
            5: 'none'
        }

        const stepActions = bypassActions[this.#land.state.code] ?? 5;

        const passActions = fb.array.split(stepActions);

        if (bypassActions[this.#land.state.code] === undefined || !fb.check.includes(passActions, this.#action).result) {

            this.#report.message.push({ modelSend: 'farmer/check', messCode: 1 });

            return false;
        }

        return true;

    }

    #prepare() {

        for (const key in this.#attrPoints) this.#attr[key] = fb.calc.scl(this.#attrPoints[key], 0, 1000, 0, 0.9);

        this.#slotInt = fb.number.round(this.#land.slot.cur, 0.01);


        const base = {
            shovel: { item: 1, stamina: 11, mental: 5 },
            fertilizer: { item: 1, stamina: 5, mental: 7 },
            seed: { item: 1, stamina: 3, mental: 15 },
            watercan: { item: 1, stamina: 6, mental: 4 },
            bucket: { item: 1, stamina: 14, mental: 2 },
            pesticide: { item: 1, stamina: 2, mental: 11 },
            sickle: { item: 1, stamina: 10, mental: 10 },
        };

        const specialRate = () => {
            if (this.#action === 'sickle') {
                switch (this.#land.type) {
                    case 'Vegetable': return fb.random.flt(0.1, 0.3);
                    case 'Fruit': return fb.random.flt(0.6, 1);
                    case 'Grain': return fb.random.flt(0.3, 0.6);
                    default: return 0;
                }
            }
            return 0;
        }

        const specialActions = fb.check.includes(['shovel', 'watercan', 'bucket'], this.#action) ? true : false;

        const slot = specialActions ? 1 : this.#slotInt;
        const dexterity = specialActions ? 0 : this.#attr.dexterity;

        this.#report.update.wastage = {
            item: base[this.#action]?.item * slot,
            stamina: base[this.#action]?.stamina * slot,
            mental: base[this.#action]?.mental * slot,
        };

        this.#report.update.wastage.item += this.#report.update.wastage.item * specialRate();
        this.#report.update.wastage.stamina += this.#report.update.wastage.stamina * specialRate();
        this.#report.update.wastage.mental += this.#report.update.wastage.mental * specialRate();

        this.#report.update.wastage.item -= this.#report.update.wastage.item * dexterity;
        this.#report.update.wastage.stamina -= this.#report.update.wastage.stamina * this.#attr.endurance;
        this.#report.update.wastage.mental -= this.#report.update.wastage.mental * this.#attr.endurance;

        this.#report.update.wastage.item = fb.number.round(this.#report.update.wastage.item);
        this.#report.update.wastage.stamina = fb.number.round(this.#report.update.wastage.stamina);
        this.#report.update.wastage.mental = fb.number.round(this.#report.update.wastage.mental);

        this.#report.update.wastage.item = this.#report.update.wastage.item < 1 ? 1 : this.#report.update.wastage.item;
        this.#report.update.wastage.stamina = this.#report.update.wastage.stamina < 1 ? 1 : this.#report.update.wastage.stamina;
        this.#report.update.wastage.mental = this.#report.update.wastage.mental < 1 ? 1 : this.#report.update.wastage.mental;

        if (this.#itemQuantity < this.#report.update.wastage.item) {
            this.#report.message.push({ modelSend: 'farmer/prepare', messCode: 4 });
            return false;
        }

        if (this.#energy.stamina < this.#report.update.wastage.stamina) {
            this.#report.message.push({ modelSend: 'farmer/prepare', messCode: 5 });
            
            return false;
        }

        if (this.#energy.mental < this.#report.update.wastage.mental) {
            this.#report.message.push({ modelSend: 'farmer/prepare', messCode: 6 });
            return false;
        }

        this.#report.change.wastage = true;

        return true;

    }

    #operation() {

        const tool = new Tool();
        tool.read(fb.array.clone(this.#land))
            .hand(this.#action)
            .learn(this.#itemID, this.#itemInfo)
            .master(this.#attr)
            .feel(this.#season)
            .repeat(1);

        const report = tool.work();

        if (!report) {
            this.#report.message.push({ modelSend: 'farmer/operation', messCode: 8 });
            this.#report.update.wastage = null;
            this.#report.state = null;
            return false;
        }

        this.#report.change.place = report.changePlace ?? false;
        this.#report.update.state = report.state ?? false;
        this.#report.update.set = report.set ?? null;
        return true;

    }


    #state() {

        if (this.#report.update.state !== false && this.#report.update.state != this.#land.state.code) {
            const name = this.#stateLabels[this.#report.update.state];
            this.#report.update.set.state =  {
                code: this.#report.update.state,
                name: name
            };
            this.#report.change.state = true;
        }
        
        return true;
    }

    #pack() {

        if (this.#land.state.code === 4 && this.#action === 'sickle') {

            const sickleYield = this.#report.update.set.yield;

            this.#report.update.pack = {
                seedID: this.#land.plantID.code,
                fertilizerID: this.#land.fertilizerID,
                yield: fb.calc.scl(this.#land.pest, 0, 5, sickleYield, sickleYield * 0.2)
            };

            this.#report.message.push({ modelSend: 'farmer/pack', messCode: 1 });

            this.#report.update.set.plantID = { code: null, name: null };
            this.#report.update.set.growth = { start: null, end: null };
            this.#report.update.set.pest = null;
            this.#report.update.set.water = { set: null, cur: null };
            this.#report.update.set.yield = 0;

            this.#report.change.pack = true;

        }

        return true;

    }

    #ecpm(result) {

        if (result) {
            this.#report.complete = true;
            this.#report.message.push({ modelSend: 'farmer/worker', messCode: 1 });
            delete this.#report.state;
            
        } else {
            
            this.#report.update = {
                wastage: null,
                set: null,
                pack: null
            };

            this.#report.change = {
                pack: null,
                place: null,
                state: null
            }

            this.#report.message.push({ modelSend: 'farmer/worker', messCode: 2 });

            delete this.#report.state;
        }

    }

    worker() {

        const steps = [
            this.#check,
            this.#prepare,
            this.#operation,
            this.#pack,
            this.#state,
        ];

        let result = true;

        for (const step of steps) {
            if (step.call(this) === false) {
                result = false;
                console.warn('Farmer process stopped at step:', step.name);
                break;
            }
        }

        this.#ecpm(result);

        return fb.array.clone(this.#report);

    }

}
