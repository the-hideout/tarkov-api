const graphqlUtil =  {
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
        const depth = graphqlUtil.getDepth(info);
        if (depth > depthLimit) throw new Error(`Query depth ${depth} exceeds maximum (${depthLimit}) for ${info.parentType}.${info.fieldName}.`);
    },
    getLang: (info, context) => {
        let lang = 'en';
        if (!info) {
            return lang;
        }
        let langFound = false;
        let myRoot = info.path.key;
        for (let currentNode = info.path.prev; currentNode; currentNode = currentNode.prev) {
            myRoot = currentNode.key;
        }
        for (const selection of info.operation.selectionSet.selections) {
            let selectionRoot = selection.name.value;
            if (selection.alias) {
                selectionRoot = selection.alias.value;
            }
            if (selectionRoot !== myRoot) {
                continue;
            }
            if (context && context.lang[myRoot]) {
                return context.lang[myRoot];
            }
            for (const arg of selection.arguments) {
                if (arg.name.value === 'lang') {
                    if (arg.value.kind === 'Variable') {
                        lang = info.variableValues.lang;
                    } else {
                        lang = arg.value.value;
                    }
                    langFound = true;
                    break;
                }
            }
            if (langFound) break;
        }
        if (context) {
            context.lang[myRoot] = lang;
        }
        return lang;
    },
    getGameMode: (info, context) => {
        let mode = 'regular';
        if (!info) {
            return mode;
        }
        let modeFound = false;
        let myRoot = info.path.key;
        for (let currentNode = info.path.prev; currentNode; currentNode = currentNode.prev) {
            myRoot = currentNode.key;
        }
        for (const selection of info.operation.selectionSet.selections) {
            let selectionRoot = selection.name.value;
            if (selection.alias) {
                selectionRoot = selection.alias.value;
            }
            if (selectionRoot !== myRoot) {
                continue;
            }
            if (context && context.gameMode[myRoot]) {
                return context.gameMode[myRoot];
            }
            for (const arg of selection.arguments) {
                if (arg.name.value === 'gameMode') {
                    if (arg.value.kind === 'Variable') {
                        mode = info.variableValues.gameMode;
                    } else {
                        mode = arg.value.value;
                    }
                    modeFound = true;
                    break;
                }
            }
            if (modeFound) break;
        }
        if (context) {
            context.gameMode[myRoot] = mode;
        }
        return mode;
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

export default graphqlUtil;
