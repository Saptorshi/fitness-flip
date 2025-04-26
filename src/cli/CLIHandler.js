const readline = require('readline');

class CLIHandler {
    constructor(app) {
        this.app = app;
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    start() {
        console.log('Welcome to FlipFit CLI');
        this.showMenu();
    }

    showMenu() {
        console.log(`
            Available Commands:
            1. addCenter <name> <city> <location> <lat> <long>
            2. addSlot <centerId> <workoutType> <startTime> <seats> <isPremium> <waitingListSize>
            3. registerUser <name> <persona> <lat> <long>
            4. getAvailableSlots <centerId> <date>
            5. showSlotsForUser <userId> <centerId> <date> [workoutType] [timeRangeStart] [timeRangeEnd]
            6. bookSlot <userId> <slotId> <date>
            7. cancelBooking <userId> <slotId> <date>
            8. viewUserBooking <userId> <date>
            9. exit
        `);

        this.rl.question('Enter command: ', async (input) => {
            await this.handleCommand(input.trim());
            if (input.trim() !== 'exit') {
                this.showMenu();
            } else {
                this.rl.close();
            }
        });
    }

    async handleCommand(input) {
        const [command, ...args] = input.split(' ');
        try {
            switch (command) {
                case 'addCenter':
                    await this.app.centerService.addCenter(args[0], args[1], args[2], parseFloat(args[3]), parseFloat(args[4]));
                    break;
                case 'addSlot':
                    await this.app.centerService.addSlot(args[0], args[1], args[2], parseInt(args[3]), args[4] === 'true', parseInt(args[5]));
                    break;
                case 'registerUser':
                    await this.app.userService.registerUser(args[0], args[1], parseFloat(args[2]), parseFloat(args[3]));
                    break;
                case 'getAvailableSlots':
                    console.log(await this.app.bookingService.getAvailableSlots(args[0], args[1]));
                    break;
                case 'showSlotsForUser':
                    console.log(await this.app.bookingService.showSlotsForUser(args[0], args[1], args[2], args[3], args[4] && { start: args[4], end: args[5] }));
                    break;
                case 'bookSlot':
                    await this.app.bookingService.bookSlot(args[0], args[1], args[2]);
                    break;
                case 'cancelBooking':
                    await this.app.bookingService.cancelBooking(args[0], args[1], args[2]);
                    break;
                case 'viewUserBooking':
                    console.log(await this.app.bookingService.viewUserBooking(args[0], args[1]));
                    break;
                case 'exit':
                    console.log('Exiting FlipFit CLI');
                    break;
                default:
                    console.log('Invalid command');
            }
        } catch (error) {
            console.error(`Error: ${error.message}`);
        }
    }
}

module.exports = { CLIHandler };