/* Quản lý kho nông sản theo từng lô, tách biệt hoàn toàn với inventory. */
class Stock extends CMS {
    constructor() { super(); }
    _table = 'stock';

    #validQuantity(value) {
        return typeof value === 'number' && Number.isFinite(value) && value > 0;
    }

    #update(index, fields) {
        if (!this.setIndex(index)) return false;
        return this.edit(fields);
    }

    #log(type, row, quantity, total = 0, details = '') {
        return db.insert('stock_transactions', {
            timestamp: Date.now(),
            type,
            seed: row.seed,
            quantity,
            unitPrice: Number(row.unitPrice) || 0,
            total: Number(total) || 0,
            batchStart: row.start,
            details
        });
    }

    receiver(pack = {}) {
        if (!pack.seed || typeof pack.seed.name !== 'string' || !pack.seed.name.trim())
            throw new Error('Stock: seed information is required.');
        if (!this.#validQuantity(pack.yield))
            throw new Error('Stock: harvest quantity must be a positive finite number.');
        const fresh = pack.seed.freshTime;
        if (!fresh || !Number.isFinite(timer.ingameToReal(fresh)) || timer.ingameToReal(fresh) <= 0)
            throw new Error('Stock: a positive freshTime is required for every crop.');
        const fertilizer = pack.fertilizer || { name: 'None', group: 'None', priceBuff: 0 };
        const quality = Math.max(0, Math.min(100, Number.isFinite(pack.quality) ? pack.quality : 70));
        const grade = quality >= 85 ? 'A' : quality >= 60 ? 'B' : 'C';
        const gradeMultiplier = grade === 'A' ? 1.15 : grade === 'B' ? 1 : 0.8;
        const priceBuff = Number.isFinite(fertilizer.priceBuff) ? fertilizer.priceBuff : 0;
        const unitPrice = Math.max(0, (Number(pack.seed.price) || 0) * (1 + priceBuff) * gradeMultiplier);
        const now = Date.now();
        const row = {
            start: now,
            end: timer.duration(fresh, 'forward'),
            seed: pack.seed.name,
            seedID: Number.isFinite(pack.seedID) ? pack.seedID : null,
            group: pack.seed.group || 'unknown',
            quality,
            qualityGrade: grade,
            fertilizer: fertilizer.name || 'None',
            fertilizerGroup: fertilizer.group || 'None',
            quantity: pack.yield,
            initialQuantity: pack.yield,
            unitPrice,
            price: unitPrice * pack.yield,
            status: 'fresh'
        };
        if (!Number.isFinite(row.end) || row.end <= now)
            throw new Error('Stock: invalid expiration timestamp.');
        const inserted = this.add(row);
        if (inserted !== false) this.#log('harvest', row, pack.yield, row.price, 'Harvest received');
        return inserted;
    }

    // Giữ tương thích với controller cũ trong các save/code path chưa chuyển tên.
    revicer(pack = {}) { return this.receiver(pack); }

    expire(now = Date.now()) {
        if (!Number.isFinite(now)) throw new Error('Stock: invalid current timestamp.');
        const rows = super.load() || [];
        let changed = 0;
        rows.forEach((row, index) => {
            if (row.status === 'fresh' && Number.isFinite(row.end) && row.end <= now) {
                this.#update(index, { status: 'expired' });
                this.#log('expired', row, Number(row.quantity) || 0, 0, 'Shelf life elapsed');
                changed++;
            }
        });
        return changed;
    }

    list(status = 'all') {
        this.expire();
        const rows = super.load() || [];
        return rows.map((row, index) => ({ ...row, _index: index }))
            .filter(row => status === 'all' || row.status === status);
    }

    sell(index, quantity) {
        this.expire();
        if (!Number.isInteger(index) || index < 0) throw new Error('Stock: invalid batch index.');
        if (!this.setIndex(index)) throw new Error('Stock: batch not found.');
        const row = this.info();
        if (!row || row.status !== 'fresh') throw new Error('Stock: only fresh batches can be sold.');
        if (!this.#validQuantity(quantity) || quantity > row.quantity)
            throw new Error('Stock: sale quantity must be positive and cannot exceed available stock.');
        const unitPrice = Number(row.unitPrice) || 0;
        const revenue = Math.round(unitPrice * quantity);
        const remaining = row.quantity - quantity;
        const fields = {
            quantity: remaining,
            price: unitPrice * remaining,
            status: remaining <= 0 ? 'sold' : 'fresh'
        };
        if (!this.edit(fields)) throw new Error('Stock: failed to update batch after sale.');
        registry.player.money = (Number(registry.player.money) || 0) + revenue;
        this.#log('sale', row, quantity, revenue, 'Crop sold');
        return { success: true, quantity, revenue, remaining, balance: registry.player.money };
    }

    discard(index, quantity) {
        this.expire();
        if (!Number.isInteger(index) || index < 0) throw new Error('Stock: invalid batch index.');
        if (!this.setIndex(index)) throw new Error('Stock: batch not found.');
        const row = this.info();
        if (!row || !['fresh', 'expired'].includes(row.status))
            throw new Error('Stock: batch cannot be discarded.');
        if (!this.#validQuantity(quantity) || quantity > row.quantity)
            throw new Error('Stock: discard quantity must be positive and cannot exceed available stock.');
        const remaining = row.quantity - quantity;
        if (!this.edit({
            quantity: remaining,
            price: (Number(row.unitPrice) || 0) * remaining,
            status: remaining <= 0 ? 'discarded' : row.status
        })) throw new Error('Stock: failed to update batch after discard.');
        this.#log('discard', row, quantity, 0, 'Stock discarded');
        return { success: true, quantity, remaining };
    }

    history(limit = 100) {
        const rows = db.select('stock_transactions', [], ['default', []], '', [], [0, limit]);
        return rows?.data || [];
    }
}
