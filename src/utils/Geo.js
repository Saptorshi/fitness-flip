function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const q1 = lat1 * Math.PI/180;
    const q2 = lat2 * Math.PI/180;
    const x1 = (lat2-lat1) * Math.PI/180;
    const x2 = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(x1/2) * Math.sin(x1/2) +
              Math.cos(q1) * Math.cos(q2) *
              Math.sin(x2/2) * Math.sin(x2/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
}

module.exports = { getDistance };
