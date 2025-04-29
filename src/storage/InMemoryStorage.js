const mapToObject = require('../utils/Convert');
class InMemoryStorage {
    constructor() {
        this.centers = new Map(); // Ensure this is a Map
        this.users = new Map();
        this.slots = new Map();
        this.bookings = new Map();
        this.locks = new Map(); // For concurrency
    }

    // Basic CRUD operations with locking for concurrency
    async acquireLock(key) {
        if (!this.locks.has(key)) {
            this.locks.set(key, Promise.resolve());
        }
        const current = this.locks.get(key);
        const next = current.then(() => Promise.resolve());
        this.locks.set(key, next);
        return current;
    }

    async releaseLock(key) {
        const current = this.locks.get(key);
        await current;
    }

    printStorage() {
        console.log('Storage Centers:', JSON.stringify(mapToObject(this.centers), null, 2));
        console.log('Storage Users:', JSON.stringify(mapToObject(this.users), null, 2));
        console.log('Storage Slots:', JSON.stringify(mapToObject(this.slots), null, 2));
        console.log('Storage Bookings:', JSON.stringify(mapToObject(this.bookings), null, 2));
        console.log('Storage Locks:', JSON.stringify(mapToObject(this.locks), null, 2));
    }
}

module.exports = { InMemoryStorage };
