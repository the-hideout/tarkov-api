// datasource for crafts 
import WorkerKV from '../utils/worker-kv.mjs';

class CraftsAPI extends WorkerKV {
    constructor(dataSource) {
        super('craft_data', dataSource);
    }

    async getList(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.Craft;
    }

    async get(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.Craft.filter(c => c.id === id);
    }

    async getCraftsForItem(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.Craft.filter(craft => {
            return craft.rewardItems.some(rew => rew.item === id);
        });
    }

    async getCraftsUsingItem(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.Craft.filter(craft => {
            return craft.requiredItems.some(req => req.item === id);
        });
    }

    async getCraftsForStation(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.Craft.filter(craft => {
            return craft.station_id === id;
        });
    }

    async getCraftsForStationLevel(context, info, id, level) {
        const { cache } = await this.getCache(context, info);
        return cache.Craft.filter(craft => {
            return craft.station_id === id && craft.level === level;
        });
    }
}

export default CraftsAPI;
