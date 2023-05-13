// datasource for crafts 
const WorkerKV = require('../utils/worker-kv');

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
            for (const item of craft.rewardItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getCraftsUsingItem(context, id) {
        await this.init(context);
        return this.cache.Craft.filter(craft => {
            for (const item of craft.requiredItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getCraftsForStation(context, id) {
        await this.init(context);
        return this.cache.Craft.filter(craft => {
            if (craft.station_id === id) return true;
            return false;
        });
    }

    async getCraftsForStationLevel(context, id, level) {
        await this.init(context);
        return this.cache.Craft.filter(craft => {
            if (craft.station_id === id && craft.level === level) return true;
            return false;
        });
    }
}

module.exports = CraftsAPI;
