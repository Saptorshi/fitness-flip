const { Center } = require('../models/Center');
const { Slot } = require('../models/Slot');

class CenterService {
    constructor(storage) {
        this.storage = storage;
    }

    async addCenter(name, city, location, lat, long) {
        const id = `center_${Date.now()}`;
        const center = new Center(id, name, city, location, lat, long);
        await this.storage.acquireLock(`center_${id}`);
        try {
            this.storage.centers.set(id, center);
        } finally {
            await this.storage.releaseLock(`center_${id}`);
        }
        console.log(`Center ${name} added successfully`);
        return center;
    }

    async addSlot(centerId, workoutType, startTime, seats, isPremium, waitingListSize) {
        const center = this.storage.centers.get(centerId);
        if (!center) throw new Error('Center not found');

        // Validate single workout type per slot time
        const existingSlots = Array.from(center.slots.values());
        const conflictingSlot = existingSlots.find(slot => 
            slot.startTime === startTime && slot.workoutType !== workoutType
        );
        if (conflictingSlot) {
            throw new Error('Only one workout type allowed per time slot');
        }

        const slotId = `slot_${Date.now()}`;
        const slot = new Slot(slotId, centerId, workoutType, startTime, seats, isPremium, waitingListSize);
        
        await this.storage.acquireLock(`center_${centerId}`);
        try {
            center.addSlot(slot);
            this.storage.slots.set(slotId, slot);
        } finally {
            await this.storage.releaseLock(`center_${centerId}`);
        }
        console.log(`Slot added to ${center.name}`);
        return slot;
    }
}

module.exports = { CenterService };