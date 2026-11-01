/* Core gameplay services: energy, economy and progression.
 * Currency is VND; crop stock quantity is grams; crop price is VND/kg.
 */

class EnergySystem {
    static recover(player, elapsedMs = 1000, isResting = false) {
        if (!player || !Array.isArray(player.stamina) || !Array.isArray(player.mental)) return false;
        const seconds = Math.max(0, Math.min(elapsedMs, 60000)) / 1000;
        const night = registry?.system?.currentDate?.[3] >= 22 || registry?.system?.currentDate?.[3] < 6;
        const multiplier = (isResting ? 2.5 : 1) * (night ? 1.25 : 1);
        const stamina = seconds * 8 * multiplier;
        const mental = seconds * 5 * multiplier;
        player.stamina[0] = Math.min(player.stamina[1], player.stamina[0] + stamina);
        player.mental[0] = Math.min(player.mental[1], player.mental[0] + mental);
        return { stamina: player.stamina[0], mental: player.mental[0] };
    }
}

class ProgressionSystem {
    static requiredXP(level = 1) {
        return Math.floor(100 * Math.pow(1.35, Math.max(0, level - 1)));
    }

    static award(player, amount, reason = 'activity') {
        if (!player || !Number.isFinite(amount) || amount <= 0) return false;
        if (!Array.isArray(player.experience)) player.experience = [0, this.requiredXP(player.level || 1)];
        const gained = Number(amount.toFixed(2));
        player.experience[0] += gained;
        const levels = [];
        while (player.experience[0] >= this.requiredXP(player.level || 1)) {
            player.experience[0] -= this.requiredXP(player.level || 1);
            player.level = (player.level || 1) + 1;
            player.attrPoints = (player.attrPoints || 0) + 10;
            levels.push(player.level);
        }
        player.experience[1] = this.requiredXP(player.level || 1);
        return { gained, reason, levels, availableAttributePoints: player.attrPoints || 0 };
    }

    static allocate(player, attribute, points = 1) {
        const allowed = ['strength', 'dexterity', 'intelligence', 'endurance'];
        points = Math.floor(points);
        if (!allowed.includes(attribute) || points < 1) return false;
        if ((player.attrPoints || 0) < points) return false;
        if (!Number.isFinite(player[attribute]) || player[attribute] + points > 1000) return false;
        player[attribute] += points;
        player.attrPoints -= points;
        return { attribute, value: player[attribute], remaining: player.attrPoints };
    }
}

class EconomySystem {
    static #groups = ['seed', 'fertilizer', 'shovel', 'sickle', 'watercan', 'bucket', 'pesticide'];

    static buy(group, itemID, quantity = 1) {
        quantity = Math.floor(quantity);
        if (!this.#groups.includes(group) || quantity < 1) return { ok: false, code: 'invalid_order' };
        const item = new LookupProduct().item(group, itemID);
        if (!item || !Number.isFinite(item.price)) return { ok: false, code: 'unknown_item' };
        const level = item.reqLevel || 1;
        if ((registry.player.level || 1) < level) return { ok: false, code: 'level_locked', requiredLevel: level };
        const total = item.price * quantity;
        if (!Number.isSafeInteger(total) || registry.player.money < total) return { ok: false, code: 'insufficient_funds', total };
        const rows = db.table.get('inventory') || [];
        const existing = rows.findIndex(row => row.groups === group && row.itemID === Number(itemID));
        registry.player.money -= total;
        if (existing >= 0) {
            rows[existing].quantity += quantity;
        } else {
            db.insert('inventory', {
                itemID: Number(itemID), name: item.name, groups: group,
                quantity, level, source: 'purchase'
            });
        }
        return { ok: true, group, itemID: Number(itemID), quantity, unitPrice: item.price, total, balance: registry.player.money };
    }

    static sellStock(index, quantity = null) {
        const rows = db.table.get('stock') || [];
        const row = rows[index];
        if (!row || !Number.isFinite(row.quantity) || !Number.isFinite(row.price)) return { ok: false, code: 'stock_not_found' };
        if (!Number.isFinite(row.start) || !Number.isFinite(row.end)) return { ok: false, code: 'invalid_freshness' };
        const amount = quantity === null ? row.quantity : Math.floor(quantity);
        if (amount <= 0 || amount > row.quantity) return { ok: false, code: 'invalid_quantity' };
        const now = Date.now();
        const freshness = row.end <= now ? 0 : Math.max(0, Math.min(1, (row.end - now) / Math.max(1, row.end - row.start)));
        if (freshness <= 0) return { ok: false, code: 'spoiled' };
        const qualityMultiplier = ({ Bio: 1.05, Eco: 1.1, Chemical: 0.95 })[row.quality] || 1;
        const gross = Math.floor((amount / 1000) * row.price * freshness * qualityMultiplier);
        if (gross <= 0) return { ok: false, code: 'no_market_value' };
        row.quantity -= amount;
        if (row.quantity === 0) rows.splice(index, 1);
        registry.player.money += gross;
        const progression = ProgressionSystem.award(registry.player, Math.max(1, Math.floor(gross / 10000)), 'sale');
        return { ok: true, sold: amount, gross, freshness, balance: registry.player.money, progression };
    }
}
