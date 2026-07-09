/* Tra cứu thông tin sản phẩm/vật phẩm ============================================================= */

class LookupProduct {

    constructor(source = 'system') {
        this.products = source === 'system' ? products ?? {} : productsCustom ?? {};
        this.detail = productDetail;
    }

    groups() {
        if (!this.products) return false;
        const lists = Object.keys(this.products);
        if (lists.length === 0) return false;
        let group = { }
        for (const list of lists) {
            group[list] = Object.keys(this.products[list]).length;
        }
        return fb.array.clone(group);

    }

    list(group, keys = [ 'name', 'price']) {
        if (!group) return false;
        if (this.products?.[group] === undefined) return false;
        const lists =  Object.keys(this.products[group]);
        if (lists.length === 0) return false;
        let list = { }
        for (const id of lists) {
            for (const key of keys) {
                if (this.products[group][id][key] !== undefined) {
                    if (!list[id]) list[id] = {};
                    list[id][key] = this.products[group][id][key];
                }
                list[id]['id'] = parseInt(id);
            }
        }
        return fb.array.clone(list); 

    }

    item(group = '', id = 0) {
        if (!group || id === null || id === undefined) return false;
        if (this.products?.[group]?.[id] === undefined) return false;
        return this.products[group][id];
    }

    mapDetail(group = '', id = 0) {
        if (!group || id === 0) return false;

        const dataItem = this.item(group, id);
        if (!dataItem) return false;

        const detail = {};
        const groupDetails = this.detail[group];

        const keys = Object.keys(dataItem);
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            if (groupDetails?.[key]) {
                const [label, , unit] = groupDetails[key];
                if (group === 'seed' && key === 'price') {
                    for (let j = 0; j < groupDetails[key].length; j++) {
                        const priceMap = groupDetails[key][j];
                        detail[`price${j}`] = {
                            label: priceMap[0],
                            value: j >= 1 ? dataItem[key] : dataItem[key] * 0.75,
                            unit: priceMap[2],
                        };
                    }
                } else {
                    detail[key] = { label, value: dataItem[key], unit };
                }
            }
        }

        return detail;
    }
}

