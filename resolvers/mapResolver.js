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
        async lootContainers(obj, args, context, info) {
            let containers = context.data.map.getAllLootContainers(context);
            return context.util.paginate(containers, args);
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
    Lock: {
        key(data, args, context, info) {
            return context.data.item.getItem(context, data.key);
        },
    },
    LootContainer: {
        name(data, args, context, info) {
            return context.data.map.getLocale(data.name, context, info);
        },
    },
    LootContainerPosition: {
        lootContainer(data, args, context, info) {
            return context.data.map.getLootContainer(context, data.lootContainer);
        },
    },
    Map: {
        accessKeys(data, args, context, info) {
            return context.data.item.getItemsByIDs(context, data.accessKeys);
        },
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
    MapExtract: {
        name(data, args, context, info) {
            return context.data.map.getLocale(data.name, context, info);
        },
        switches(data, args, context) {
            if (!data.switches) {
                return [];
            }
            return data.switches.map(switchId => context.data.map.getSwitch(context, switchId));
        },
    },
    MapHazard: {
        name(data, args, context, info) {
            return context.data.map.getLocale(data.name, context, info);
        },
    },
    MapSwitch: {
        /*door(data, args, context) {

        },*/
        /*extract(data, args, context) {
            return context.data.map.getExtract(context, data.extract);
        },*/
        /*extractTip(data, args, context, info) {
            if (!data.extractTip) {
                return null;
            }
            return context.data.map.getLocale(data.extractTip, context, info);
        },*/
        activatedBy(data, args, context) {
            return context.data.map.getSwitch(context, data.activatedBy);
        },
        name(data, args, context, info) {
            if (!data.name) {
                return null;
            }
            return context.data.map.getLocale(data.name, context, info);
        },
    },
    MapSwitchOperation: {
        target(data, args, context) {
            if (data.switch) {
                return context.data.map.getSwitch(context, data.switch);
            }
            return context.data.map.getExtract(context, data.extract);
        },
    },
    MapSwitchTarget: {
        __resolveType(data, args, context) {
            if (data.switchType) return 'MapSwitch';
            return 'MapExtract';
        },
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
        async switch(data, args, context, info) {
            return context.data.map.getSwitch(context, data.switch);
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
    },
    StationaryWeapon: {
        name(data, args, context, info) {
            return context.data.map.getLocale(data.name, context, info);
        },
        shortName(data, args, context, info) {
            return context.data.map.getLocale(data.shortName, context, info);
        },
    },
    StationaryWeaponPosition: {
        stationaryWeapon(data, args, context, info) {
            return context.data.map.getStationaryWeapon(context, data.stationaryWeapon);
        },
    },
};
