const WorkerKV = require('../utils/worker-kv');

class MapAPI extends WorkerKV {
    constructor(dataSource) {
        super('map_data', dataSource);
    }

    async getList() {
        await this.init();
        return this.cache.Map;
    }

    async get(id) {
        await this.init();
        for (const map of this.cache.Map) {
            if (map.id === id || map.tarkovDataId === id) return map;
        }
        return Promise.reject(new Error(`No map found with id ${id}`));
    }

    async getMapsByNames(names, maps = false, lang = 'en') {
        await this.init();
        if (!maps) {
            maps = this.cache.Map;
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
            maps = this.cache.Map;
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

    async getAllBosses() {
        await this.init();
        return Object.values(this.cache.MobInfo);
    }

    async getMobInfo(mobId) {
        await this.init();
        return this.cache.MobInfo[mobId];
    }

    async getBossesByNames(names, bosses = false, lang = 'en') {
        await this.init();
        if (!bosses) {
            bosses = Object.values(this.cache.MobInfo);
        }
        const searchStrings = names.map(name => {
            if (name === '') throw new Error('Searched boss name cannot be blank');
            return name.toLowerCase();
        });

        return bosses.filter((boss) => {
            if (!boss.locale || !boss.locale[lang]) return false;
            for (const search of searchStrings) {
                if (boss.locale[lang].name && boss.locale[lang].name.toString().toLowerCase().includes(search)) {
                    return true;
                }
            }
            return false;
        });
    }
}

module.exports = MapAPI;
