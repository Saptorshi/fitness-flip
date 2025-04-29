const { getDistance } = require('../utils/Geo');
const { USER_PERSONA } = require('../constants/UserPersona');

class BookingService {
    constructor(storage, notificationService) {
        this.storage = storage;
        this.notificationService = notificationService;
    }

    async getAvailableSlots(centerId, date, userId) {
        const center = this.storage.centers.get(centerId);
        if (!center) throw new Error('Center not found');

        const user = this.storage.users.get(userId);
        if (!user) throw new Error('User not found');

        const isVip = user.persona === USER_PERSONA.VIP;

        const slots = Array.from(center.slots.values());
        const availableSlots = slots
        .filter(slot => slot.date === date) // filter by date
        .filter(slot => isVip || !slot.isPremium) // restrict premium for normal users
        .map(slot => {
            const bookings = slot.bookings.get(date) || new Set();
            return {
                slotId: slot.id,
                workoutType: slot.workoutType,
                startTime: slot.startTime,
                endTime: slot.endTime,
                date: slot.date,
                availableSeats: slot.seats - bookings.size,
                isPremium: slot.isPremium
            };
        });
        
        return availableSlots;
    }

    async showSlotsForUser(userId, date, workoutType = null, timeRange = null) {
        console.log(timeRange, "timeRange");
        console.log(timeRange.start);
        console.log(timeRange.end);
        const user = this.storage.users.get(userId);
        if (!user) throw new Error('User not found');
    
        const result = [];
    
        for (const slot of this.storage.slots.values()) {
            if (slot.date !== date) continue;
    
            if (slot.isPremium && user.persona !== USER_PERSONA.VIP) continue;
    
            if (workoutType && slot.workoutType !== workoutType) continue;
    
            if (timeRange) {
                const slotStart = slot.startTime;
                if (slotStart < timeRange.start || slotStart > timeRange.end) {
                    continue;
                }
            }
    
            const center = this.storage.centers.get(slot.centerId);
            if (!center) continue;
    
            const bookings = slot.bookings.get(date) || new Map();
    
            result.push({
                centerId: center.id,
                centerName: center.name,
                slotId: slot.id,
                workoutType: slot.workoutType,
                startTime: slot.startTime,
                endTime: slot.endTime,
                date: slot.date,
                availableSeats: slot.seats - bookings.size,
                isPremium: slot.isPremium,
                distance: getDistance(user.lat, user.long, center.lat, center.long)
            });
        }
    
        return result.sort((a, b) => a.distance - b.distance);
    }

    async bookSlot(userId, slotId, date) {
        const user = this.storage.users.get(userId);
        const slot = this.storage.slots.get(slotId);
        if (!user || !slot) throw new Error('User or Slot not found');

        if (slot.isPremium && user.persona !== USER_PERSONA.VIP) {
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
            console.log(this.storage.printStorage()); // Debugging log
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
            console.log(this.storage.printStorage()); // Debugging log
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