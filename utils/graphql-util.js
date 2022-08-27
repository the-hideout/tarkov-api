module.exports = {
    getDepth: (info) => {
        let depth = 0;
        let currentLevel = info.path;
        while (currentLevel.prev) {
            if (!Number.isInteger(currentLevel.key)) depth++;
            currentLevel = currentLevel.prev;
        }
        return depth;
    },
    testDepthLimit: (info, depthLimit) => {
        const depth = module.exports.getDepth(info);
        if (depth > depthLimit) throw new Error(`Query depth ${depth} exceeds maximum (${depthLimit}) for ${info.parentType}.${info.fieldName}.`);
    },
    getLang: (info) => {
        let lang = 'en';
        let langFound = false;
        for (const selection of info.operation.selectionSet.selections) {
            for (const arg of selection.arguments) {
                if (arg.name.value === 'lang') {
                    lang = arg.value.value;
                    langFound = true;
                    break;
                }
            }
            if (langFound) break;
        }
        return lang;
    },
    getLocale: (data, field, info) => {
        const lang = module.exports.getLang(info);
        if (data.locale && lang in data.locale && field in data.locale[lang]) return data.locale[lang][field];
        return data[field];
    },
    paginate: async (data, args) => {
        data = await data;
        if (!Array.isArray(data)) return data;
        let limit = args.limit;
        let offset = args.offset;
        if (!limit && !offset) return data;
        if (typeof limit === 'undefined') return data.slice(offset);
        if (typeof offset === 'undefined') offset = 0;
        let end = Math.abs(limit)+offset;
        if (offset < 0) end = data.length-Math.abs(offset)+limit;
        return data.slice(offset, end);
    }
};
