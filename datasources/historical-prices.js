const WorkerKV = require('../utils/worker-kv');

class historicalPricesAPI extends WorkerKV {
    constructor(dataSource) {
        super('historical_price_data', dataSource);
    }

    async getByItemId(requestId, itemId) {
        await this.init(requestId);
        if (!this.cache) {
            return Promise.reject(new Error('Historical prices cache is empty'));
        }
        if (!this.cache.historicalPricePoint[itemId]) return [];
        return this.cache.historicalPricePoint[itemId];
    }
}

module.exports = historicalPricesAPI;
