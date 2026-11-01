/* Quản lý kho hàng nông sản.
 * quantity is stored in grams; price is VND per kilogram.
 */
class Stock extends CMS {
    constructor() { super(); }
    _table = 'stock';

    revicer(pack) {
        if (!pack || !pack.seed || !Number.isFinite(pack.yield) || pack.yield <= 0) return false;
        const fertilizer = pack.fertilizer || { group: 'None', priceBuff: 0 };
        const unpack = {
            start: Date.now(),
            end: timer.duration(pack.seed.freshTime, 'forward'),
            seed: pack.seed.name,
            group: pack.seed.group,
            quality: fertilizer.group,
            quantity: Math.floor(pack.yield),
            price: Math.max(0, Math.round(pack.seed.price * (1 + (fertilizer.priceBuff || 0)))),
            priceUnit: 'VND/kg',
            quantityUnit: 'g'
        };
        return this.add(unpack);
    }
}
