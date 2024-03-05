// datasource for crafts 
import WorkerKV from '../utils/worker-kv.mjs';

class CraftsAPI extends WorkerKV {
    constructor(dataSource) {
        super('craft_data', dataSource);
    }

    async getList(context) {
        await this.init(context);
        return this.cache.Craft;
    }

    async get(context, id) {
        await this.init(context);
        return this.cache.Craft.filter(c => c.id === id);
    }

    async getCraftsForItem(context, id) {
        await this.init(context);
        return this.cache.Craft.filter(craft => {
            return craft.rewardItems.some(rew => rew.item === id);
        });
    }

    async getCraftsUsingItem(context, id) {
        await this.init(context);
        return this.cache.Craft.filter(craft => {
            return craft.requiredItems.some(req => req.item === id);
        });
    }

    async getCraftsForStation(context, id) {
        await this.init(context);
        return this.cache.Craft.filter(craft => {
            return craft.station_id === id;
        });
    }

    async getCraftsForStationLevel(context, id, level) {
        await this.init(context);
        return this.cache.Craft.filter(craft => {
            return craft.station_id === id && craft.level === level;
        });
    }
}

export default CraftsAPI;
