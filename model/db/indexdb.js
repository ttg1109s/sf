/* Lớp wrapper thao tác với IndexedDB ============================================================== */

class IndexDB {
    constructor(dbName, version = 1) {
        this.dbName = dbName;
        this.version = version;
        this.db = null;
    }

    // Open or create the database
    open(storeName, keyPath = 'id') {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath });
                }
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onerror = (event) => {
                reject(`Failed to open database: ${event.target.errorCode}`);
            };
        });
    }

    // Add or update a record
    save(storeName, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.put(data);

            request.onsuccess = () => resolve(`Data saved successfully: ${JSON.stringify(data)}`);
            request.onerror = (event) => reject(`Failed to save data: ${event.target.errorCode}`);
        });
    }

    // Get a record by key
    get(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.get(key);

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(`Failed to get data: ${event.target.errorCode}`);
        });
    }

    // Get all records
    getAll(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = (event) => resolve(event.target.result);
            request.onerror = (event) => reject(`Failed to get all data: ${event.target.errorCode}`);
        });
    }

    // Delete a record by key
    delete(storeName, key) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.delete(key);

            request.onsuccess = () => resolve(`Data deleted successfully: ${key}`);
            request.onerror = (event) => reject(`Failed to delete data: ${event.target.errorCode}`);
        });
    }

    // Clear all records in a store
    clear(storeName) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(storeName, 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.clear();

            request.onsuccess = () => resolve(`All data cleared in store: ${storeName}`);
            request.onerror = (event) => reject(`Failed to clear data: ${event.target.errorCode}`);
        });
    }
}

