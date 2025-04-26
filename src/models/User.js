class User {
    constructor(id, name, persona, lat, long) {
        this.id = id;
        this.name = name;
        this.persona = persona; // FK_VIP_USER or FK_NORMAL_USER
        this.lat = lat;
        this.long = long;
    }
}

module.exports = { User };