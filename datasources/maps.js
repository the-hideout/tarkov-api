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
}

module.exports = MapAPI;
