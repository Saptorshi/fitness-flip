const { getDistance } = require('../utils/Geo');

class BookingService {
    constructor(storage, notificationService) {
        this.storage = storage;
        this.notificationService = notificationService;
    }

    async getAvailableSlots(centerId, date) {
        const center = this.storage.centers.get(centerId);
        if (!center) throw new Error('Center not found');

        const slots = Array.from(center.slots.values());
        const availableSlots = slots.map(slot => {
            const bookings = slot.bookings.get(date) || new Set();
            return {
                slotId: slot.id,
                workoutType: slot.workoutType,
                startTime: slot.startTime,
                availableSeats: slot.seats - bookings.size,
                isPremium: slot.isPremium
            };
        });
        return availableSlots;
    }

    async showSlotsForUser(userId, centerId, date, workoutType, timeRange) {
        const user = this.storage.users.get(userId);
        const center = this.storage.centers.get(centerId);
        if (!user || !center) throw new Error('User or Center not found');

        const slots = Array.from(center.slots.values())
            .filter(slot => 
                (!slot.isPremium || user.persona === 'FK_VIP_USER') &&
                (!workoutType || slot.workoutType === workoutType) &&
                (!timeRange || (slot.startTime >= timeRange.start && slot.startTime <= timeRange.end))
            );

        // Sort by distance
        return slots.sort((a, b) => {
            const distA = getDistance(user.lat, user.long, center.lat, center.long);
            const distB = getDistance(user.lat, user.long, center.lat, center.long);
            return distA - distB;
        });
    }

    async bookSlot(userId, slotId, date) {
        const user = this.storage.users.get(userId);
        const slot = this.storage.slots.get(slotId);
        if (!user || !slot) throw new Error('User or Slot not found');

        if (slot.isPremium && user.persona !== 'FK_VIP_USER') {
            throw new Error('Normal users cannot book VIP slots');
        }

        // Check 3 slots per day limit
        const userBookings = this.storage.bookings.get(userId) || new Map();
        const dayBookings = Array.from(userBookings.entries())
            .filter(([d]) => d === date)
            .length;
        if (dayBookings >= 3) {
            throw new Error('Maximum 3 slots per day allowed');
        }

        await this.storage.acquireLock(`slot_${slotId}_${date}`);
        try {
            const bookings = slot.bookings.get(date) || new Set();
            if (bookings.size >= slot.seats) {
                const waitingList = slot.waitingList.get(date) || [];
                if (waitingList.length >= slot.waitingListSize) {
                    throw new Error('Waiting list full');
                }
                waitingList.push({ userId, isVip: user.persona === 'FK_VIP_USER' });
                slot.waitingList.set(date, waitingList);
                console.log(`User ${userId} added to waiting list`);
                return false;
            }

            bookings.add(userId);
            slot.bookings.set(date, bookings);
            userBookings.set(`${slotId}_${date}`, slot);
            this.storage.bookings.set(userId, userBookings);
            this.notificationService.notifyBookingConfirmation(userId, slotId, date);
            console.log(`Slot booked successfully for user ${userId}`);
            return true;
        } finally {
            await this.storage.releaseLock(`slot_${slotId}_${date}`);
        }
    }

    async cancelBooking(userId, slotId, date) {
        const user = this.storage.users.get(userId);
        const slot = this.storage.slots.get(slotId);
        if (!user || !slot) throw new Error('User or Slot not found');

        await this.storage.acquireLock(`slot_${slotId}_${date}`);
        try {
            const bookings = slot.bookings.get(date);
            if (!bookings || !bookings.has(userId)) {
                throw new Error('No booking found');
            }

            bookings.delete(userId);
            slot.bookings.set(date, bookings);
            this.notificationService.notifyCancellation(userId, slotId, date);

            // Process waiting list
            const waitingList = slot.waitingList.get(date) || [];
            if (waitingList.length > 0) {
                // Prioritize VIP users
                const nextUser = waitingList.find(u => u.isVip) || waitingList[0];
                waitingList.splice(waitingList.findIndex(u => u.userId === nextUser.userId), 1);
                slot.waitingList.set(date, waitingList);

                const newBookings = slot.bookings.get(date) || new Set();
                newBookings.add(nextUser.userId);
                slot.bookings.set(date, newBookings);
                this.notificationService.notifyBookingConfirmation(nextUser.userId, slotId, date);
            }

            console.log(`Booking cancelled for user ${userId}`);
        } finally {
            await this.storage.releaseLock(`slot_${slotId}_${date}`);
        }
    }

    async viewUserBooking(userId, date) {
        const userBookings = this.storage.bookings.get(userId) || new Map();
        return Array.from(userBookings.entries())
            .filter(([key]) => key.includes(date))
            .map(([key, slot]) => ({
                slotId: slot.id,
                workoutType: slot.workoutType,
                startTime: slot.startTime
            }));
    }
}

module.exports = { BookingService };