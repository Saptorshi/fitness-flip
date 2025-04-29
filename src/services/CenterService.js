const dayjs = require("dayjs");

const { Center } = require("../models/Center");
const { Slot } = require("../models/Slot");

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
		console.log(`Center ID : ${id}, Center ${name} added successfully`);
		console.log(this.storage.printStorage()); // Debugging log
		return center;
	}

	async addSlot(centerId, workoutType, startTime, endTime, date, seats, isPremium, waitingListSize) {
		const center = this.storage.centers.get(centerId);
		if (!center) throw new Error("Center not found");

		// Validate date: must be today or future
		const today = dayjs().startOf("day");
		const slotDate = dayjs(date, "YYYY-MM-DD");
		if (!slotDate.isValid() || slotDate.isBefore(today)) {
			throw new Error("Slot date must be today or a future date");
		}

		// Validate time: endTime must be after startTime
		const start = dayjs(`${date} ${startTime}`, "YYYY-MM-DD HH:mm");
		const end = dayjs(`${date} ${endTime}`, "YYYY-MM-DD HH:mm");
		if (!start.isValid() || !end.isValid() || !end.isAfter(start)) {
			throw new Error("End time must be after start time");
		}

		// Validate single workout type per slot time
		const existingSlots = Array.from(center.slots.values());
		const conflictingSlot = existingSlots.find(slot => 
            slot.date === date &&
            slot.startTime === startTime &&
            slot.workoutType === workoutType &&
            slot.isPremium === isPremium 
        );
		if (conflictingSlot) {
			throw new Error("Only one workout type allowed per time slot");
		}

		const slotId = `slot_${Date.now()}`;
        const slot = new Slot(slotId, centerId, workoutType, startTime, endTime, date, seats, isPremium, waitingListSize);

		await this.storage.acquireLock(`center_${centerId}`);
		try {
			center.addSlot(slot);
			this.storage.slots.set(slotId, slot);
		} finally {
			await this.storage.releaseLock(`center_${centerId}`);
		}
		console.log(
			`Slot ${slotId} added to ${center.name} ${JSON.stringify(slot, 2)}`
		);
		console.log(this.storage.printStorage()); // Debugging log

		return slot;
	}
}

module.exports = { CenterService };
