const WorkerKV = require('../utils/worker-kv');

class MapAPI extends WorkerKV {
    constructor(dataSource) {
        super('map_data', dataSource);
    }

    async getList(context) {
        await this.init(context);
        return this.cache.Map;
    }

    async get(context, id) {
        await this.init(context);
        for (const map of this.cache.Map) {
            if (map.id === id || map.tarkovDataId === id) return map;
        }
        return Promise.reject(new Error(`No map found with id ${id}`));
    }

    async getMapsByNames(context, info, names, maps = false) {
        await this.init(context);
        if (!maps) {
            maps = this.cache.Map;
        }
        const searchStrings = names.map(name => {
            if (name === '') throw new Error('Searched map name cannot be blank');
            return name.toLowerCase();
        });

        return maps.filter((map) => {
            for (const search of searchStrings) {
                if (this.getLocale(map.name, context, info).toString().toLowerCase().includes(search)) {
                    return true;
                }
            }
            return false;
        });
    }

    async getMapsByEnemies(context, info, enemies, maps = false) {
        await this.init(context);
        if (!maps) {
            maps = this.cache.Map;
        }
        const searchStrings = enemies.map(name => {
            if (name === '') throw new Error('Searched enemy name cannot be blank');
            return name.toLowerCase();
        });

        return maps.filter((map) => {
            if (!map.locale || !map.locale[lang]) return false;
            for (const search of searchStrings) {
                if (this.getLocale(map.enemies, context, info).some(enemy => enemy.toString().toLowerCase().includes(search))) {
                    return true;
                }
            }
            return false;
        });
    }

    async getAllBosses(context) {
        await this.init(context);
        return Object.values(this.cache.MobInfo);
    }

    async getMobInfo(context, mobId) {
        await this.init(context);
        return this.cache.MobInfo[mobId];
    }

    async getBossesByNames(context, info, names, bosses = false) {
        await this.init(context);
        if (!bosses) {
            bosses = Object.values(this.cache.MobInfo);
        }
        const searchStrings = names.map(name => {
            if (name === '') throw new Error('Searched boss name cannot be blank');
            return name.toLowerCase();
        });

        return bosses.filter((boss) => {
            for (const search of searchStrings) {
                if (this.getLocale(boss.name, context, info).toString().toLowerCase().includes(search)) {
                    return true;
                }
            }
            return false;
        });
    }

    async getLootContainer(context, id) {
        await this.init(context);
        return this.cache.LootContainer[id];
    }

    async getAllLootContainers(context) {
        await this.init(context);
        return Object.values(this.cache.LootContainer);
    }

    async getExtract(context, id) {
        await this.init(context);
        return this.cache.Map.reduce((found, current) => {
            if (found) {
                return found;
            }
            found = current.extracts.find(e => e.id === id);
            return found;
        }, false);
    }

    async getSwitch(context, id) {
        await this.init(context);
        return this.cache.Map.reduce((found, current) => {
            if (found) {
                return found;
            }
            found = current.switches.find(e => e.id === id);
            return found;
        }, false);
    }
}

module.exports = MapAPI;
