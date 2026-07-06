/*
    model/cms.js — Generic CRUD base class (add/edit/remove/load/count/...) that concrete managers extend by setting `_table`.
*/

import { fb } from './utils.js';
import { db } from './database-instance.js';

export class CMS  {

    _table = null;


    setIndex(index) {
        this.index = index;
        if (this.info() === false) {
            return false;
        }
        return true;
    }

    #checkTable() {
        if (!this._table) {
            throw new Error('Table is not defined in this class.');
        }
        if (!fb.check.type(this._table, 'string', false)) {
            throw new Error('Table must be a valid string.');
        }
    }

    #checkIndex() {
        this.#checkTable();
        if (this.index === -1) {
            throw new Error('You want to use this function with a valid index (not < 0).');
        }
    }

    #checkSet(set = {}) {

        if (!fb.check.type(set, 'object', false)) {
            throw new Error('Set must be a valid object.');
        }
        if (fb.check.array(set) === true) {
            throw new Error('Set must be not array).');
        }
        let key = Object.keys(set);
        if (key.length === 0) {
            throw new Error('Set must be a not empty.');
        }

        if (key.length === 1) {
            key = key[0];
        }

        const columns = db.getColumns(this._table) || [];

        if (fb.check.includes(columns, key).result === false) {
            throw new Error('Set must be a has valid column.');
        }

        
        return true;
    }

    columnExists(column = '') {
        const columns = db.getColumns(this._table) || [];
        return fb.check.includes(column, columns).result;
    }

    count() {
        this.#checkTable();
        return db.count(this._table) || 0;
    }

    load({sort = ['default', []], where = '', limit = [0, 0]} = {}) {
        return db.select(this._table, [], sort, where, [], limit).data || false;
    }

    info({where = '', columns = []} = {}) {
        this.#checkIndex();
        return db.select(this._table, [this.index], ['default', []], where, columns, [0, 0])?.data[0] || false;
    }

    add(data) {
        this.#checkTable();
        return db.insert(this._table, data);
    }

    remove() {
        this.#checkIndex();
        return db.delete(this._table, this.index);
    }

    edit(set = {}) {
        this.#checkIndex();
        this.#checkSet(set);
        return db.update(this._table, this.index, set);
    }

    empty(backup = false) {
        this.#checkTable();
        return db.empty(this._table, backup);
    }

}
