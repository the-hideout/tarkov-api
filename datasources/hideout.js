const WorkerKV = require('../utils/worker-kv');

class HideoutAPI extends WorkerKV {
    constructor() {
        super('hideout_data');
    }

    async getList(){
        await this.init();
        return this.cache.data;
    }

    async getModuleById(id) {
        await this.init();
        for (const hideoutStation of this.cache.data) {
            for (const stage of hideoutStation.levels) {
                if (stage.id === id) {
                    return stage;
                }
            }
        }
        return Promise.reject(new Error(`No hideout station level found with id ${id}`));
    }

    async getModuleByLevel(stationId, level) {
        await this.init();
        for (const hideoutStation of this.cache.data) {
            if (hideoutStation.id !== stationId) continue;
            for (const stage of hideoutStation.levels) {
                if (stage.level === level) {
                    return stage;
                }
            }
        }
        return Promise.reject(new Error(`No hideout station level found with id ${stationId} and level ${level}`));
    }

    async getStation(id) {
        await this.init();
        for (const station of this.cache.data) {
            if (station.id === id) return station;
        }
        return Promise.reject(new Error(`No hideout station found with id ${id}`));
    }
}

module.exports = HideoutAPI;
