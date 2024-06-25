import WorkerKV from '../utils/worker-kv.mjs';

class MapAPI extends WorkerKV {
    constructor(dataSource) {
        super('map_data', dataSource);
        this.gameModes.push('pve');
    }

    async getList(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.Map;
    }

    async get(context, info, id) {
        const { cache } = await this.getCache(context, info);
        for (const map of cache.Map) {
            if (map.id === id || map.tarkovDataId === id) return map;
        }
        return Promise.reject(new Error(`No map found with id ${id}`));
    }

    async getMapsByNames(context, info, names, maps = false) {
        const { cache } = await this.getCache(context, info);
        if (!maps) {
            maps = cache.Map;
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
        const { cache } = await this.getCache(context, info);
        if (!maps) {
            maps = cache.Map;
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

    async getAllBosses(context, info) {
        const { cache } = await this.getCache(context, info);
        return Object.values(cache.MobInfo);
    }

    async getMobInfo(context, info, mobId) {
        const { cache } = await this.getCache(context, info);
        return cache.MobInfo[mobId];
    }

    async getBossesByNames(context, info, names, bosses = false) {
        const { cache } = await this.getCache(context, info);
        if (!bosses) {
            bosses = Object.values(cache.MobInfo);
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

    async getLootContainer(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.LootContainer[id];
    }

    async getAllLootContainers(context, info) {
        const { cache } = await this.getCache(context, info);
        return Object.values(cache.LootContainer);
    }

    async getExtract(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.Map.reduce((found, current) => {
            if (found) {
                return found;
            }
            found = current.extracts.find(e => e.id === id);
            return found;
        }, false);
    }

    async getSwitch(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.Map.reduce((found, current) => {
            if (found) {
                return found;
            }
            found = current.switches.find(e => e.id === id);
            return found;
        }, false);
    }

    async getStationaryWeapon(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.StationaryWeapon[id];
    }

    async getAllStationaryWeapons(context, info) {
        const { cache } = await this.getCache(context, info);
        return Object.values(cache.StationaryWeapon);
    }
}

export default MapAPI;
