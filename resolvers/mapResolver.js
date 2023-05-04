module.exports = {
    Query: {
        async bosses(obj, args, context, info) {
            let bosses = false;
            const lang = context.util.getLang(info);
            let filters = {
                name: async names => {
                    return context.data.map.getBossesByNames(names, bosses, lang);
                },
            }
            const nonFilterArgs = ['lang', 'limit', 'offset'];
            for (const argName in args) {
                if (nonFilterArgs.includes(argName)) continue;
                if (!filters[argName]) return Promise.reject(new Error(`${argName} is not a recognized argument`));
                bosses = await filters[argName](args[argName], bosses);
            }
            if (!bosses) {
                bosses = context.data.map.getAllBosses();
            }
            return context.util.paginate(bosses, args);
        },
        async maps(obj, args, context, info) {
            let maps = false;
            const lang = context.util.getLang(info);
            let filters = {
                name: async names => {
                    return context.data.map.getMapsByNames(names, maps, lang);
                },
                enemies: async enemies => {
                    return context.data.map.getMapsByEnemies(enemies, maps, lang);
                },
            }
            const nonFilterArgs = ['lang', 'limit', 'offset'];
            for (const argName in args) {
                if (nonFilterArgs.includes(argName)) continue;
                if (!filters[argName]) return Promise.reject(new Error(`${argName} is not a recognized argument`));
                maps = await filters[argName](args[argName], maps);
            }
            if (!maps) {
                maps = context.data.map.getList();
            }
            return context.util.paginate(maps, args);
        }
    },
    HealthPart: {
        bodyPart(data, args, context, info) {
            return context.util.getLocale(data, 'bodyPart', info);
        }
    },
    Map: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        },
        enemies(data, args, context, info) {
            return context.util.getLocale(data, 'enemies', info);
        }
    },
    MobInfo: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        }
    },
    BossSpawn: {
        boss(data, args, context, info) {
            return context.data.map.getMobInfo(data.id);
        },
        async name(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(data.id);
            return context.util.getLocale(boss, 'name', info);
        },
        async normalizedName(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(data.id);
            return boss.normalizedName;
        },
        async spawnTrigger(data, args, context, info) {
            return context.util.getLocale(data, 'spawnTrigger', info);
        },
    },
    BossSpawnLocation: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        },
    },
    BossEscort: {
        boss(data, args, context, info) {
            return context.data.map.getMobInfo(data.id);
        },
        async name(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(data.id);
            return context.util.getLocale(boss, 'name', info);
        },
        async normalizedName(data, args, context, info) {
            const boss = await context.data.map.getMobInfo(data.id);
            return boss.normalizedName;
        }
    }
};
