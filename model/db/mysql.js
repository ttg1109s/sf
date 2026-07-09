/*

    Faker MYSQL Class =====================================================================

*/

class MySQL {
    constructor(config = {}) {
        this.config = {
            host: 'localhost',
            user: 'root',
            password: '',
            database: 'test'
        };
        this.table = new Map(); // Each table is a key, and its value is an array of records
        this.tableColumns = new Map(); // Each table is a key, and its value is an array of column names
        this.connected = false;
    }

    connect(host, user, password, database) {
        if (!host || !user || !database) return false;
        if (host !== this.config.host
            || user !== this.config.user
            || password !== this.config.password
            || database !== this.config.database) {
            throw new Error('MySQL: Connection failed. Check your credentials.');
        }
        this.connected = true;
        return true;
    }

    disconnect() {
        if (this.connected) {
            this.connected = false;
            return true;
        } else {
            return false;
        }
    }

    #checkConnection() {
        if (!this.connected) {
            throw new Error('MySQL: Not connected to the database.');
        }
        return true;
    }

    #checkTable(tableName) {
        if (!this.table.has(tableName)) {
            throw new Error(`MySQL: Table "${tableName}" does not exist.`);
        }
        return true;
    }

    #checkColumns(tableName, data = {}) {
        if (this.#checkConnection() === false) return false;
        if (this.#checkTable(tableName) === false) return false;
        const tableCols = this.tableColumns.get(tableName);
        const dataKeys = Object.keys(data);
        for (const key of dataKeys) {
            if (!tableCols.includes(key)) {
                throw new Error(`MySQL: Column "${key}" does not exist in table "${tableName}".`);
            }
        }
        return true;
    }

    #whereFilter(record, where) {
        const orConditions = where.split("||").map(orCond => orCond.trim());

        for (const orCondition of orConditions) {
            const andConditions = orCondition.split("&&").map(andCond => andCond.trim());
            let andResult = true;

            for (const condition of andConditions) {
                const match = condition.match(
                    /record\.(\w+)\s*(===|==|!==|!=|>=|<=|>|<)\s*(?:(['"])(.*?)\3|(-?\d+(?:\.\d+)?)|(true|false|null))/
                );

                if (match) {
                    const [, key, operator, , stringValue, numberValue, boolOrNull] = match;
                    const recordValue = record[key];

                    let parsedValue;
                    if (stringValue !== undefined) {
                        parsedValue = stringValue;
                    } else if (numberValue !== undefined) {
                        parsedValue = Number(numberValue);
                    } else if (boolOrNull !== undefined) {
                        if (boolOrNull === "true") parsedValue = true;
                        else if (boolOrNull === "false") parsedValue = false;
                        else parsedValue = null;
                    } else {
                        throw new Error(`MySQL: Could not parse value in condition "${condition}".`);
                    }

                    let lhs = recordValue;
                    let rhs = parsedValue;
                    if (typeof lhs === "string" && !isNaN(lhs) && typeof rhs === "number") lhs = Number(lhs);
                    if (typeof rhs === "string" && !isNaN(rhs) && typeof lhs === "number") rhs = Number(rhs);

                    if (!fb.calc.logic(lhs, operator, rhs)) {
                        andResult = false;
                        break;
                    }
                } else {
                    andResult = false;
                    break;
                }
            }

            if (andResult) return true;
        }

        return false;
    }

    createTable(tableName, column = []) {
        if (this.table.has(tableName)) {
            throw new Error(`MySQL: Table "${tableName}" already exists.`);
        }

        if (column.length === 0) {
            throw new Error('MySQL: No columns provided to create table.');
        }

        this.table.set(tableName, []);
        this.tableColumns.set(tableName, column);
        return true;
    }

    getColumns(tableName) {
        if (!this.#checkConnection()) return false;
        if (!this.#checkTable(tableName)) return false;
        return this.tableColumns.get(tableName);
    }

    count(tableName) {
        if (!this.#checkConnection()) return false;
        if (!this.#checkTable(tableName)) return false;

        const table = this.table.get(tableName);
        return table.length;
    }

    insert(tableName, data = {}) {
        if (!this.#checkConnection()) return false;
        if (!this.#checkTable(tableName)) return false;
        if (!this.#checkColumns(tableName, data)) return false;
        
        const table = this.table.get(tableName);
        table.push(fb.array.clone(data));
        return true;
    }

    select(tableName, index = [], sort = ['default', []], where = '', columns = [], limit = [0, 0]) {
        if (!this.#checkConnection()) return false;
        if (!this.#checkTable(tableName)) return false;

        const [start, len] = limit;
        if (len < start) {
            throw new Error('MySQL: Invalid limit parameters.');
        }

        const startTime = performance.now();
        const table = this.table.get(tableName);
        
        let records = [];
        if (index.length === 0) index = Array.from({ length: table.length }, (_, i) => i);

        for (let i = 0; i < index.length; i++) {

            if (i < start) continue;

            if (i >= start + len && start + len > 0) break;

            if (table[index[i]] === undefined) continue;

            let record = fb.array.clone(table[index[i]]);

            if (where && !this.#whereFilter(record, where)) continue;

            

            if (columns.length > 0) {
                let filtered = {};
                for (let j = 0; j < columns.length; j++) {
                    const col = columns[j];
                    filtered[col] = record[col];
                }
                record = filtered;
               
            }

            records.push(fb.array.clone(record));
        }

        if (sort[0] !== 'default') {
            const [direction, column] = sort;
            fb.array.sortBy(records, direction, column);
        }

        return {
            time: performance.now() - startTime,
            data: fb.array.clone(records),
            count: records.length
        };
    }

    update(tableName, index = -1,  set = {}, where = '') {

        if (!this.#checkConnection()) return false;

        if (!this.#checkTable(tableName)) return false;

        const record = this.table.get(tableName)[index];

        if (index === -1 || record === undefined) {
            throw new Error('MySQL: No index provided or record not found to update.');
        }

        const key = Object.keys(set);

        if (key.length === 0) {
            throw new Error('MySQL: No data provided to update.');
        }

        if (where && !this.#whereFilter(record, where)) {
            return false;
        }

        for (let i = 0; i < key.length; i++) {
            const k = key[i];
            record[k] = fb.array.clone(set[k]);
        }

        return true;
    }

    delete(tableName, index = -1, where = '') {
        if (!this.#checkConnection()) return false;
        if (!this.#checkTable(tableName)) return false;

        let table = this.table.get(tableName);

        if (index === -1 || table[index] === undefined) {
            throw new Error('MySQL: No index provided or record not found to delete.');
        }
        if (where && !this.#whereFilter(table[index], where)) {
            return false;
        }

        table.splice(index, 1);
        
        return true;

    }

    empty(tableName, backup = false) {
        if (!this.#checkConnection()) return false;
        if (!this.#checkTable(tableName)) return false;
        if (backup) {
            const backupData = this.table.get(tableName);
            const backupColumns = this.tableColumns.get(tableName);

            const backupContent = JSON.stringify({
                columns: backupColumns,
                data: backupData
            }, null, 2);

            const blob = new Blob([backupContent], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `${tableName}_backup_${Date.now()}_${fb.random.string(8)}.json`;
            a.click();

            URL.revokeObjectURL(url);
           
        }
    
        this.table.set(tableName, []);
        return true;

    }

}

