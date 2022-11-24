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
        let myRoot = info.path.key;
        for (let currentNode = info.path.prev; currentNode; currentNode = currentNode.prev) {
            myRoot = currentNode.key;
        }
        for (const selection of info.operation.selectionSet.selections) {
            let selectionRoot = selection.name.value;
            if (selection.alias)
                selectionRoot = selection.alias.value;
            if (selectionRoot !== myRoot)
                continue;
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
        if (data.locale && lang in data.locale && field in data.locale[lang]) 
            return data.locale[lang][field];
        if (data.locale && data.locale.en && field in data.locale.en)
            return data.locale.en[field];
        return data[field];
    },
    getLocales: (data, args) => {
        const locales = [];
        let en;
        if (Array.isArray(args.fields) && args.fields.length < 1) {
            throw new Error(`You must provide at least one value for the "fields" argument to the "locales" field`)
        }
        if (Array.isArray(args.languages) && args.languages.length < 1) {
            throw new Error(`You must provide at least one value for the "languages" argument to the "locales" field`)
        }
        for (const langCode in data.locale) {
            const locale = {
                language: langCode,
                fields: []
            };
            for (const fieldName in data.locale[langCode]) {
                if (!args.fields.includes(fieldName)) {
                    continue;
                }
                locale.fields.push({
                    name: fieldName,
                    value: data.locale[langCode][fieldName]
                });
            }
            if (langCode === 'en') {
                en = locale;
            }
            if (!args.languages.includes(langCode)) {
                continue;
            }
            locales.push(locale);
        }
        for (const locale of locales) {
            if (locale.language === 'en') {
                continue;
            }
            for (const field of en.fields) {
                const found = locale.fields.some(f => f.name === field.name);
                if (!found) {
                    locale.fields.push(field);
                }
            }
        }

        for (const langCode of args.languages) {
            const found = locales.some(loc => loc.language === langCode);
            if (!found) {
                locales.push({
                    language: langCode,
                    fields: en.fields
                });
            }
        }
        return locales;
    },
    paginate: async (data, args) => {
        data = await data;
        if (!Array.isArray(data)) return data;
        let limit = args.limit;
        let offset = args.offset;
        if (!limit && !offset) return data;
        if (typeof limit === 'undefined') return data.slice(offset);
        if (typeof offset === 'undefined') offset = 0;
        let end = Math.abs(limit) + offset;
        if (offset < 0) end = data.length - Math.abs(offset) + limit;
        return data.slice(offset, end);
    }
};
