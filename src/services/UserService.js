const { User } = require('../models/User');
const { USER_PERSONA } = require('../constants/UserPersona');

class UserService {
    constructor(storage) {
        this.storage = storage;
    }

    async registerUser(name, persona, lat, long) {
        if (!Object.values(USER_PERSONA).includes(persona)) {
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
        console.log(`UserID : ${id},  User ${name} registered successfully`);
        console.log(this.storage.printStorage()); // Debugging log
        return user;
    }
}

module.exports = { UserService };