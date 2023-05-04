const WorkerKV = require('../utils/worker-kv');

class HideoutAPI extends WorkerKV {
    constructor(dataSource) {
        super('hideout_data', dataSource);
    }

    async getList() {
        await this.init();
        return this.cache.HideoutStation;
    }

    async getModuleById(id) {
        await this.init();
        for (const hideoutStation of this.cache.HideoutStation) {
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
        for (const hideoutStation of this.cache.HideoutStation) {
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
        for (const station of this.cache.HideoutStation) {
            if (station.id === id) return station;
        }
        return Promise.reject(new Error(`No hideout station found with id ${id}`));
    }

    async getLegacyList() {
        await this.init();
        return this.cache.HideoutModule;
    }

    async getLegacyModule(name, level) {
        await this.init();
        for (const module of this.cache.HideoutModule) {
            if (module.name === name && module.quantity === level) {
                return module;
            }
        }
        return Promise.reject(new Error(`No hideout module with id ${id} found`));
    }
}

module.exports = HideoutAPI;
