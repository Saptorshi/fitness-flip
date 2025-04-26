class Slot {
    constructor(id, centerId, workoutType, startTime, seats, isPremium, waitingListSize) {
        this.id = id;
        this.centerId = centerId;
        this.workoutType = workoutType; // Cardio, Yoga, Strength
        this.startTime = startTime;
        this.seats = seats;
        this.isPremium = isPremium;
        this.waitingListSize = waitingListSize;
        this.bookings = new Map(); // Map<date, Set<userId>>
        this.waitingList = new Map(); // Map<date, Array<{userId, isVip}>>
    }
}

module.exports = { Slot };
