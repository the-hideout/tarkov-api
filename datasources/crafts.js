// datasource for crafts 
const WorkerKV = require('../utils/worker-kv');

class CraftsAPI extends WorkerKV {
    constructor(){
        super('CRAFT_DATA_V2');
    }

    async getList() {
        await this.init();
        return this.cache.data;
    }

    async getCraftsForItem(id) {
        await this.init();
        return this.cache.data.filter(craft => {
            for (const item of craft.rewardItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getCraftsUsingItem(id) {
        await this.init();
        return this.cache.data.filter(craft => {
            for (const item of craft.requiredItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getCraftsForStation(id) {
        await this.init();
        return this.cache.data.filter(craft => {
            if (craft.station_id === id) return true;
            return false;
        });
    }

    async getCraftsForStationLevel(id, level) {
        await this.init();
        return this.cache.data.filter(craft => {
            if (craft.station_id === id && craft.level === level) return true;
            return false;
        });
    }
}

module.exports = CraftsAPI;
