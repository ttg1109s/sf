/* Quản lý kho hàng nông sản ======================================================================= */

class Stock extends CMS {
    constructor() {
        super();
    }

    _table = 'stock';

    revicer(pack) {

        const unpack = {
            start: Date.now(),
            end: timer.duration(pack.seed.freshTime, 'forward'),
            seed: pack.seed.name,
            group: pack.seed.group,
            quality: pack.fertilizer.group,
            quantity: pack.yield,
            price: pack.seed.price + pack.seed.price * pack.fertilizer.priceBuff
        }

        return this.add(unpack);
    }

}


