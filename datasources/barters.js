const WorkerKV = require('../utils/worker-kv');

class BartersAPI extends WorkerKV {
    constructor() {
        super('barter_data');
    }

    async getList() {
        await this.init();
        return this.cache.data;
    }

    async getBartersForItem(id) {
        await this.init();
        return this.cache.data.filter(barter => {
            for (const item of barter.rewardItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getBartersUsingItem(id) {
        await this.init();
        return this.cache.data.filter(barter => {
            for (const item of barter.requiredItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getBartersForTrader(id) {
        await this.init();
        return this.cache.data.filter(barter => {
            if (barter.trader_id === id) return true;
            return false;
        });
    }

    async getBartersForTraderLevel(id, level) {
        await this.init();
        return this.cache.data.filter(barter => {
            if (barter.trader_id === id && barter.level === level) return true;
            return false;
        });
    }
}

module.exports = BartersAPI;
