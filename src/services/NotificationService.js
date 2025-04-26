class NotificationService {
    notifyBookingConfirmation(userId, slotId, date) {
        console.log(`Notification: Booking confirmed for user ${userId} in slot ${slotId} on ${date}`);
    }

    notifyCancellation(userId, slotId, date) {
        console.log(`Notification: Booking cancelled for user ${userId} in slot ${slotId} on ${date}`);
    }
}

module.exports = { NotificationService };