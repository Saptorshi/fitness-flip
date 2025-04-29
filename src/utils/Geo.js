function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const q1 = lat1 * Math.PI/180; // Defines Earth's radius in meters.
    const q2 = lat2 * Math.PI/180;
    const x1 = (lat2-lat1) * Math.PI/180; // Convert both latitudes from degrees to radians 
    const x2 = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(x1/2) * Math.sin(x1/2) +
              Math.cos(q1) * Math.cos(q2) *
              Math.sin(x2/2) * Math.sin(x2/2); // Compute the difference in latitude and longitude — in radians.
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); // Apply the Haversine formula's a component — capturing spherical distance factor.

    return R * c;
}

module.exports = { getDistance };
