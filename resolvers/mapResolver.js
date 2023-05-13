module.exports = {
    Query: {
        async bosses(obj, args, context, info) {
            let bosses = false;
            let filters = {
                name: async names => {
                    return context.data.map.getBossesByNames(context, info, names, bosses);
                },
            }
            const nonFilterArgs = ['lang', 'limit', 'offset'];
            for (const argName in args) {
                if (nonFilterArgs.includes(argName)) continue;
                if (!filters[argName]) return Promise.reject(new Error(`${argName} is not a recognized argument`));
                bosses = await filters[argName](args[argName], bosses);
            }
            if (!bosses) {
                bosses = context.data.map.getAllBosses(context);
            }
            return context.util.paginate(bosses, args);
        },
        async maps(obj, args, context, info) {
            let maps = false;
            let filters = {
                name: async names => {
                    return context.data.map.getMapsByNames(context, info, names, maps);
                },
                enemies: async enemies => {
                    return context.data.map.getMapsByEnemies(context, info, enemies, maps);
                },
            }
            const nonFilterArgs = ['lang', 'limit', 'offset'];
            for (const argName in args) {
                if (nonFilterArgs.includes(argName)) continue;
                if (!filters[argName]) return Promise.reject(new Error(`${argName} is not a recognized argument`));
                maps = await filters[argName](args[argName], maps);
            }
            if (!maps) {
                maps = context.data.map.getList(context);
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
            return context.data.map.getMobInfo(context, data.id);
        },
        async name(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(context, data.id);
            return context.data.map.getLocale(boss.name, context, info);
        },
        async normalizedName(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(context, data.id);
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
            return context.data.map.getMobInfo(context, data.id);
        },
        async name(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(context, data.id);
            return context.data.map.getLocale(boss.name, context, info);
        },
        async normalizedName(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(context, data.id);
            return boss.normalizedName;
        }
    }
};
