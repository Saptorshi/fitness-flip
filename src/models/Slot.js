class Slot {
    constructor(id, centerId, workoutType, startTime, endTime, date, seats, isPremium, waitingListSize) {
        this.id = id;
        this.centerId = centerId;
        this.workoutType = workoutType; // Cardio, Yoga, Strength
        this.startTime = startTime; // Expected in 'HH:MM' format, '10:00'
        this.endTime = endTime;
        this.date = date; // Expected in 'YYYY-MM-DD' format, '2025-05-01'
        this.seats = seats;
        this.isPremium = isPremium;
        this.waitingListSize = waitingListSize;
        this.bookings = new Map(); // Map<date, Set<userId>>
        this.waitingList = new Map(); // Map<date, Array<{userId, isVip}>>
    }
}

module.exports = { Slot };
