const { CenterService } = require('./services/CenterService');
const { UserService } = require('./services/UserService');
const { BookingService } = require('./services/BookingService');
const { InMemoryStorage } = require('./storage/InMemoryStorage');
const { NotificationService } = require('./services/NotificationService');

class FlipFitApp {
    constructor() {
        // Strategy Pattern for storage (easy to swap storage mechanism)
        this.storage = new InMemoryStorage();
        this.notificationService = new NotificationService();
        this.centerService = new CenterService(this.storage);
        this.userService = new UserService(this.storage);
        this.bookingService = new BookingService(this.storage, this.notificationService);
    }
}

module.exports = { FlipFitApp };
