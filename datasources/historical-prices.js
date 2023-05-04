const WorkerKV = require('../utils/worker-kv');

class historicalPricesAPI extends WorkerKV {
    constructor(dataSource) {
        super('historical_price_data', dataSource);
    }

    async getByItemId(itemId, limit = 0) {
        await this.init();
        if (!this.cache) {
            return Promise.reject(new Error('Historical prices cache is empty'));
        }
        if (!this.cache.historicalPricePoint[itemId]) return [];
        if (limit) {
            return this.cache.historicalPricePoint[itemId].slice(Math.max(this.cache.historicalPricePoint[itemId].length - limit, 0));
        }
        return this.cache.historicalPricePoint[itemId];
    }
}

module.exports = historicalPricesAPI;
