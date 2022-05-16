module.exports = (object, list = [], include = false) => {
    const attributes = {
        int: [],
        float: [],
        string: [],
        boolean: []
    }
    for (const att in object) {
        if ((list.includes(att) && !include) || (!list.includes(att) && include)) continue;
        const val = object[att];
        let type = typeof val;
        if (type === 'number') {
            if (Number.isInteger(val)) {
                type = 'int';
            } else {
                type = 'float';
            }
        }
        if (!attributes[type]) continue;
        attributes[type].push({
            name: att,
            value: val
        });
    }
    return attributes;
};
