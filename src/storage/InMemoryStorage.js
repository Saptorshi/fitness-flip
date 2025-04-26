class InMemoryStorage {
    constructor() {
        this.centers = new Map();
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
}

module.exports = { InMemoryStorage };
