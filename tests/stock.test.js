const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function createStock() {
    const tables = { stock: [], stock_transactions: [] };
    const db = {
        insert(table, row) { tables[table].push({ ...row }); return true; },
        select(table) { return { data: tables[table].map(row => ({ ...row })) }; },
        update(table, index, fields) { Object.assign(tables[table][index], fields); return true; }
    };
    class CMS {
        constructor() { this.index = -1; }
        add(row) { return db.insert(this._table, row); }
        load() { return db.select(this._table).data; }
        setIndex(index) { if (!tables[this._table][index]) return false; this.index = index; return true; }
        info() { return tables[this._table][this.index] || false; }
        edit(fields) { if (this.index < 0) return false; return db.update(this._table, this.index, fields); }
    }
    const context = {
        CMS, db, Date, Math, Number, Object, Array, Error,
        registry: { player: { money: 1000 } },
        timer: {
            ingameToReal: () => 1,
            duration: () => Date.now() + 1000
        }
    };
    vm.createContext(context);
    const source = fs.readFileSync(require.resolve('../model/stock.js'), 'utf8');
    vm.runInContext(source + '\nglobalThis.Stock = Stock;', context);
    return { stock: new context.Stock(), tables, registry: context.registry };
}

const seed = { name: 'Spinach', group: 'vegetable', price: 100, freshTime: { d: 1 } };
const fertilizer = { name: 'Compost', group: 'Bio', priceBuff: 0.1 };

test('nhập kho tạo lô riêng và lưu hạn dùng theo timestamp', () => {
    const { stock, tables } = createStock();
    assert.equal(stock.receiver({ seed, fertilizer, seedID: 1, yield: 10, quality: 90 }), true);
    assert.equal(tables.stock.length, 1);
    assert.equal(tables.stock[0].quantity, 10);
    assert.equal(tables.stock[0].qualityGrade, 'A');
    assert.ok(tables.stock[0].end > tables.stock[0].start);
    assert.equal(tables.stock_transactions[0].type, 'harvest');
});

test('bán một phần trừ đúng tồn kho và cộng tiền; không cho bán vượt tồn', () => {
    const { stock, tables, registry } = createStock();
    stock.receiver({ seed, fertilizer, yield: 10, quality: 90 });
    const result = stock.sell(0, 4);
    assert.equal(result.quantity, 4);
    assert.equal(result.remaining, 6);
    assert.equal(registry.player.money, 100506);
    assert.equal(tables.stock[0].quantity, 6);
    assert.throws(() => stock.sell(0, 7), /cannot exceed/);
});

test('lô quá hạn chuyển trạng thái expired và không thể bán', () => {
    const { stock, tables } = createStock();
    stock.receiver({ seed, fertilizer, yield: 3, quality: 70 });
    stock.expire(Date.now() + 2000);
    assert.equal(tables.stock[0].status, 'expired');
    assert.throws(() => stock.sell(0, 1), /only fresh batches/);
    assert.ok(tables.stock_transactions.some(row => row.type === 'expired'));
});

test('hủy hàng cập nhật số lượng và ghi lịch sử', () => {
    const { stock, tables } = createStock();
    stock.receiver({ seed, fertilizer, yield: 5, quality: 70 });
    const result = stock.discard(0, 2);
    assert.equal(result.remaining, 3);
    assert.equal(tables.stock[0].quantity, 3);
    assert.equal(tables.stock_transactions.at(-1).type, 'discard');
});

test('từ chối dữ liệu thu hoạch không hợp lệ', () => {
    const { stock } = createStock();
    assert.throws(() => stock.receiver({ seed, fertilizer, yield: 0 }), /positive finite/);
    assert.throws(() => stock.receiver({ seed: { ...seed, freshTime: null }, fertilizer, yield: 1 }), /freshTime/);
});

test('không cho nhập vượt sức chứa hiện có', () => {
    const { stock } = createStock();
    stock.receiver({ seed, fertilizer, yield: 5000, quality: 70 });
    assert.throws(() => stock.receiver({ seed, fertilizer, yield: 1, quality: 70 }), /capacity exceeded/);
});
