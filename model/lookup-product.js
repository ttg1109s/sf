/*
    model/lookup-product.js — Read-only lookup helper over the static product catalogs (seed/fertilizer/...).
*/

import { products, productsCustom } from './products-data.js';

export class LookupProduct {

    constructor(source = 'system') {
        this.products = source === 'system' ? products ?? {} : productsCustom ?? {};
    }

    list(group) {
        if (!group) return false;
        if (this.products?.[group] === undefined) return false;
        return this.products[group];
    }

    item(group = '', id = 0) {
        if (!group || id === null || id === undefined) return false;
        if (this.products?.[group]?.[id] === undefined) return false;
        return this.products[group][id];
    }

}
