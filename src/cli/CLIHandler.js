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
            2. addSlot <centerId> <workoutType> <startTime (HH:MM)> <endTime (HH:MM)> <date (YYYY-MM-DD)> <seats> <isPremium> <waitingListSize>
            3. registerUser <name> <persona> <lat> <long>
            4. getAvailableSlots <centerId> <date>
            5. showSlotsForUser <userId> <centerId> <date> [workoutType] [timeRangeStart] [timeRangeEnd]
            6. bookSlot <userId> <slotId> <date>
            7. cancelBooking <userId> <slotId> <date>
            8. viewUserBooking <userId> <date>
            9. exit
        `);

        // #addCenter adds a new center
        // addCenter Bellandur-Center Bengaluru Bellandur 10.20 11.20
        // center_1745922952937
        // addCenter Marathahalli-Center Bengaluru Marathahalli 60.20 50.20
        // center_1745922956688
        // addCenter SilkBoard-Center Bengaluru SilkBoard 100.20 200.20
        // center_1745920269632

        // # addSlot adds new slots to a center validating overlapping slots
        // addSlot center_1745922952937 Cardio 10:00 11:00 2025-04-29 2 true 2
        // slot_1745910019449
        // addSlot center_1745922956688 Weights 10:00 11:00 2025-04-29 2 true 2
        // addSlot center_1745920269632 Cardio 10:00 11:00 2025-04-29 2 true 2

        // # registerUser adds new user w.r.t VIP / NORMAL
        // registerUser Saptorshi FK_VIP_USER 10:10 11:10
        // user_1745922994011
        // registerUser Das FK_NORMAL_USER 11:10 12:10
        // user_1745917126987
        // registerUser Rahul FK_NORMAL_USER 11:10 12:10
        // user_1745736461862

        // # getAvailableSlots returns available slots for a center w.r.t date & persona
        // getAvailableSlots center_1745917398530 2025-04-29 user_1745917477621
        // getAvailableSlots center_1745917398530 2025-04-29 user_1745917483633

        // showSlotsForUser user_1745922994011 2025-04-29
        // showSlotsForUser user_1745922994011 2025-04-29 Cardio
        // showSlotsForUser user_1745922994011 2025-04-29 Cardio 10:00 10:30

        // bookSlot user_1745910075440 slot_1745910019449 2025-04-29
        // viewUserBooking user_1745910075440 2025-04-29

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
                    await this.app.centerService.addSlot(args[0], args[1], args[2], args[3], args[4], parseInt(args[5]), args[6] === 'true', parseInt(args[7]));
                    break;
                case 'registerUser':
                    await this.app.userService.registerUser(args[0], args[1], parseFloat(args[2]), parseFloat(args[3]));
                    break;
                case 'getAvailableSlots':
                    console.log(await this.app.bookingService.getAvailableSlots(args[0], args[1], args[2]));
                    break;
                case 'showSlotsForUser':
                    const [userId, date, workoutType, startTime, endTime] = args;
                    const timeRange = startTime && endTime ? { start: startTime, end: endTime } : null;
                    console.log(await this.app.bookingService.showSlotsForUser(userId, date, workoutType || null, timeRange));
                    break;
                case 'bookSlot':
                    await this.app.bookingService.bookSlot(args[0], args[1], args[2]);
                    break;case 'showSlotsForUser':
                    console.log(await this.app.bookingService.showSlotsForUser(args[0], args[1], args[2], args[3], args[4] && { start: args[4], end: args[5] }));
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