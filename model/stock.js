/*
    model/stock.js — CMS specialization for the 'stock' table (harvested, packed goods) + gram->kg pack pooling keyed by fertilizerID.
*/

import { CMS } from './cms.js';
import { fb } from './utils.js';
import { timer } from './timer.js';
import { db } from './database-instance.js';
import { ConfigSys } from '../controller/config.js';

export class Stock extends CMS {
    constructor() {
        super();
    }

    _table = 'stock';

    #pendingIndex(seedName, fertilizerID) {
        const rows = db.select('stockPending', [], ['default', []], '', [], [0, 0])?.data || [];
        return rows.findIndex(r => r.seed === seedName && r.fertilizerID === fertilizerID);
    }

    revicer(pack) {

        const packSize = ConfigSys.stock.packSizeGram;

        const unitPrice = pack.seed.price + pack.seed.price * pack.fertilizer.priceBuff;
        const quality = pack.fertilizer.type;

        const pendingIdx = this.#pendingIndex(pack.seed.name, pack.fertilizerID);
        const leftoverGrams = pendingIdx === -1 ? 0 : (db.select('stockPending', [pendingIdx])?.data[0]?.grams ?? 0);

        const totalGrams = leftoverGrams + pack.yield;
        const fullPacks = Math.floor(totalGrams / packSize);
        const remainderGrams = totalGrams % packSize;

        for (let i = 0; i < fullPacks; i++) {
            this.add({
                start: Date.now(),
                end: timer.duration(pack.seed.freshTime, 'forward'),
                seed: pack.seed.name,
                group: pack.seed.group,
                quality: quality,
                price: unitPrice,
                quantity: 1
            });
        }

        if (pendingIdx === -1) {
            if (remainderGrams > 0) {
                db.insert('stockPending', {
                    seed: pack.seed.name,
                    group: pack.seed.group,
                    quality: quality,
                    fertilizerID: pack.fertilizerID,
                    price: unitPrice,
                    grams: remainderGrams
                });
            }
        } else if (remainderGrams > 0) {
            db.update('stockPending', pendingIdx, { grams: remainderGrams, price: unitPrice });
        } else {
            db.delete('stockPending', pendingIdx);
        }

        return { packsAdded: fullPacks, totalValue: fullPacks * unitPrice, leftoverGrams: remainderGrams };
    }

}
