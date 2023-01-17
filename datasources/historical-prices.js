const WorkerKV = require('../utils/worker-kv');

class historicalPricesAPI extends WorkerKV {
    constructor(dataSource) {
        super('historical_price_data', dataSource);
        this.refreshInterval = 1000 * 60 * 30;
    }

    async getByItemId(requestId, itemId) {
        await this.init(requestId);
        if (!this.cache) {
            return Promise.reject(new Error('Historical prices cache is empty'));
        }
        if (!this.cache.data[itemId]) return [];
        return this.cache.data[itemId];
    }
}

module.exports = historicalPricesAPI;
