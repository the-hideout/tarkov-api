const WorkerKV = require('../utils/worker-kv');

class MapAPI extends WorkerKV {
    constructor() {
        super('map_data');
        this.refreshInterval = 1000 * 60 * 20;
    }

    async getList() {
        await this.init();
        return this.cache.data;
    }

    async get(id) {
        await this.init();
        for (const map of this.cache.data) {
            if (map.id === id || map.tarkovDataId === id) return map;
        }
        return Promise.reject(new Error(`No map found with id ${id}`));
    }

    async getMapsByNames(names, maps = false, lang = 'en') {
        await this.init();
        if (!maps) {
            maps = this.cache.data;
        }
        const searchStrings = names.map(name => {
            if (name === '') throw new Error('Searched map name cannot be blank');
            return name.toLowerCase();
        });

        return maps.filter((map) => {
            if (!map.locale || !map.locale[lang]) return false;
            for (const search of searchStrings) {
                if (map.locale[lang].name && map.locale[lang].name.toString().toLowerCase().includes(search)) {
                    return true;
                }
            }
            return false;
        });
    }

    async getMapsByEnemies(enemies, maps = false, lang = 'en') {
        await this.init();
        if (!maps) {
            maps = this.cache.data;
        }
        const searchStrings = enemies.map(name => {
            if (name === '') throw new Error('Searched enemy name cannot be blank');
            return name.toLowerCase();
        });

        return maps.filter((map) => {
            if (!map.locale || !map.locale[lang]) return false;
            for (const search of searchStrings) {
                if (map.locale[lang].enemies && map.locale[lang].enemies.some(enemy => enemy.toString().toLowerCase().includes(search))) {
                    return true;
                }
            }
            return false;
        });
    }

    async getMobInfo(mobId) {
        await this.init();
        return this.cache.mobs[mobId];
    }
}

module.exports = MapAPI;
