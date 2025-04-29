class Center {
    constructor(id, name, city, location, lat, long, slots = new Map()) {
        this.id = id;
        this.name = name;
        this.city = city;
        this.location = location;
        this.lat = lat;
        this.long = long;
        this.slots = slots; // Ensure this is initialized as a Map
        this.workoutTypes = new Set();
    }

    addSlot(slot) {
        this.slots.set(slot.id, slot);
        this.workoutTypes.add(slot.workoutType);
    }
}

module.exports = { Center };