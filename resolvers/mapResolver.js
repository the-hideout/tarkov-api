module.exports = {
    Query: {
        async bosses(obj, args, context, info) {
            let bosses = false;
            const lang = context.util.getLang(info, context);
            let filters = {
                name: async names => {
                    return context.data.map.getBossesByNames(context.requestId, names, bosses, lang);
                },
            }
            const nonFilterArgs = ['lang', 'limit', 'offset'];
            for (const argName in args) {
                if (nonFilterArgs.includes(argName)) continue;
                if (!filters[argName]) return Promise.reject(new Error(`${argName} is not a recognized argument`));
                bosses = await filters[argName](args[argName], bosses);
            }
            if (!bosses) {
                bosses = context.data.map.getAllBosses(context.requestId);
            }
            return context.util.paginate(bosses, args);
        },
        async maps(obj, args, context, info) {
            let maps = false;
            const lang = context.util.getLang(info, context);
            let filters = {
                name: async names => {
                    return context.data.map.getMapsByNames(context.requestId, names, maps, lang);
                },
                enemies: async enemies => {
                    return context.data.map.getMapsByEnemies(context.requestId, enemies, maps, lang);
                },
            }
            const nonFilterArgs = ['lang', 'limit', 'offset'];
            for (const argName in args) {
                if (nonFilterArgs.includes(argName)) continue;
                if (!filters[argName]) return Promise.reject(new Error(`${argName} is not a recognized argument`));
                maps = await filters[argName](args[argName], maps);
            }
            if (!maps) {
                maps = context.data.map.getList(context.requestId);
            }
            return context.util.paginate(maps, args);
        }
    },
    HealthPart: {
        bodyPart(data, args, context, info) {
            return context.data.map.getLocale(data.bodyPart, context, info);
        }
    },
    Map: {
        name(data, args, context, info) {
            return context.data.map.getLocale(data.name, context, info);
        },
        description(data, args, context, info) {
            return context.data.map.getLocale(data.description, context, info);
        },
        enemies(data, args, context, info) {
            return context.data.map.getLocale(data.enemies, context, info);
        }
    },
    MobInfo: {
        name(data, args, context, info) {
            return context.data.map.getLocale(data.name, context, info);
        }
    },
    BossSpawn: {
        boss(data, args, context, info) {
            return context.data.map.getMobInfo(context.requestId, data.id);
        },
        async name(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(context.requestId, data.id);
            return context.data.map.getLocale(boss.name, context, info);
        },
        async normalizedName(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(context.requestId, data.id);
            return boss.normalizedName;
        },
        async spawnTrigger(data, args, context, info) {
            return context.data.map.getLocale(data.spawnTrigger, context, info);
        },
    },
    BossSpawnLocation: {
        name(data, args, context, info) {
            return context.data.map.getLocale(data.name, context, info);
        },
    },
    BossEscort: {
        boss(data, args, context, info) {
            return context.data.map.getMobInfo(context.requestId, data.id);
        },
        async name(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(context.requestId, data.id);
            return context.data.map.getLocale(boss.name, context, info);
        },
        async normalizedName(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(context.requestId, data.id);
            return boss.normalizedName;
        }
    }
};
