import { GraphQLError } from 'graphql';

import WorkerKV from '../utils/worker-kv.mjs';

class HideoutAPI extends WorkerKV {
    constructor(dataSource) {
        super('hideout_data', dataSource);
        this.gameModes.push('pve');
    }

    async getList(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.HideoutStation;
    }

    async getModuleById(context, info, id) {
        const { cache } = await this.getCache(context, info);
        for (const hideoutStation of cache.HideoutStation) {
            for (const stage of hideoutStation.levels) {
                if (stage.id === id) {
                    return stage;
                }
            }
        }
        return Promise.reject(new GraphQLError(`No hideout station level found with id ${id}`));
    }

    async getModuleByLevel(context, info, stationId, level) {
        const { cache } = await this.getCache(context, info);
        for (const hideoutStation of cache.HideoutStation) {
            if (hideoutStation.id !== stationId) continue;
            for (const stage of hideoutStation.levels) {
                if (stage.level === level) {
                    return stage;
                }
            }
        }
        return Promise.reject(new GraphQLError(`No hideout station level found with id ${stationId} and level ${level}`));
    }

    async getStation(context, info, id) {
        const { cache } = await this.getCache(context, info);
        for (const station of cache.HideoutStation) {
            if (station.id === id) return station;
        }
        return Promise.reject(new GraphQLError(`No hideout station found with id ${id}`));
    }

    async getLegacyList(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.HideoutModule;
    }

    async getLegacyModule(context, info, name, level) {
        const { cache } = await this.getCache(context, info);
        for (const module of cache.HideoutModule) {
            if (module.name === name && module.quantity === level) {
                return module;
            }
        }
        return Promise.reject(new GraphQLError(`No hideout module with id ${id} found`));
    }
}

export default HideoutAPI;
