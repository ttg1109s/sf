/* Quản lý túi đồ (inventory) của người chơi ======================================================= */

class InventoryManager extends CMS {
    constructor(itemIndex = -1) {
        super();
        this.index = itemIndex;
    }

    _table = 'inventory';

    sort(column = 'groups', direction = 'asc', inPage = true) {

        if (!fb.check.type(column, 'string'))
            throw new Error('Column must be a valid string.');

        if (!fb.check.type(direction, 'string'))
            throw new Error('Direction must be a valid string.');

        if (!fb.check.type(inPage, 'boolean'))
            throw new Error('InPage must be a valid boolean.');

        if (fb.check.includes(['asc', 'desc'], direction).result === false)
            throw new Error('Direction must be "asc" or "desc".');

        if (!this.columnExists(column))
            throw new Error(`Column "${column}" does not exist in table "${this._table}".`);

        if (inPage) {
            const data = this.load();
            if (data === false) return false;
            return fb.array.sortBy(data, direction, column);
        } else {
            const newSort = this.load({ sort: [direction, [column]] });
            if (newSort === false) return false;
            
            const count = this.count();

            this.empty();
            for (let i = 0; i < count; i++) {
                this.add(newSort[i]);
            }
        }

    }

}

