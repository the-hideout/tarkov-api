import { v4 as uuidv4 } from 'uuid';

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
    getDefaultContext: (dataSource) => {
        return {
            requestId: uuidv4(),
            requestStart: new Date(),
            data: dataSource,
            util: graphqlUtil,
            arguments: {},
            warnings: [],
            errors: [],
        };
    },
    getRoot: (info) => {
        let myRoot = info.path.key;
        for (let currentNode = info.path.prev; currentNode; currentNode = currentNode.prev) {
            myRoot = currentNode.key;
        }
        return myRoot;
    },
    getArgument: (info, argumentName, defaultValue, context) => {
        let argValue = defaultValue;
        if (!info) {
            return argValue;
        }
        let argumentFound = false;
        const myRoot = graphqlUtil.getRoot(info);
        for (const selection of info.operation.selectionSet.selections) {
            let selectionRoot = selection.name.value;
            if (selection.alias) {
                selectionRoot = selection.alias.value;
            }
            if (selectionRoot !== myRoot) {
                continue;
            }
            if (context && !context.arguments[myRoot]) {
                context.arguments[myRoot] = {};
            }
            if (context && context.arguments[myRoot][argumentName]) {
                return context.arguments[myRoot][argumentName];
            }
            for (const arg of selection.arguments) {
                if (arg.name.value === argumentName) {
                    if (arg.value.kind === 'Variable') {
                        argValue = info.variableValues[argumentName];
                    } else {
                        argValue = arg.value.value;
                    }
                    argumentFound = true;
                    break;
                }
            }
            if (argumentFound) break;
        }
        if (context) {
            context.arguments[myRoot][argumentName] = argValue;
        }
        return argValue;
    },
    getLang: (info, context) => {
        return graphqlUtil.getArgument(info, 'lang', 'en', context);
    },
    getGameMode: (info, context) => {
        return graphqlUtil.getArgument(info, 'gameMode', 'regular', context);
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
