const { User } = require('../models/User');

class UserService {
    constructor(storage) {
        this.storage = storage;
    }

    async registerUser(name, persona, lat, long) {
        if (!['FK_VIP_USER', 'FK_NORMAL_USER'].includes(persona)) {
            throw new Error('Invalid persona');
        }
        const id = `user_${Date.now()}`;
        const user = new User(id, name, persona, lat, long);
        await this.storage.acquireLock(`user_${id}`);
        try {
            this.storage.users.set(id, user);
        } finally {
            await this.storage.releaseLock(`user_${id}`);
        }
        console.log(`User ${name} registered successfully`);
        return user;
    }
}

module.exports = { UserService };