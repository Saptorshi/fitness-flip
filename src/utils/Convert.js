module.exports = function mapToObject(obj) {
    if (obj instanceof Map) {
        const result = {};
        for (const [key, value] of obj.entries()) {
            result[key] = mapToObject(value); // recurse
        }
        return result;
    } else if (typeof obj === 'object' && obj !== null) {
        const result = {};
        for (const key of Object.keys(obj)) {
            result[key] = mapToObject(obj[key]); // recurse
        }
        return result;
    } else {
        return obj; // primitive value
    }
}