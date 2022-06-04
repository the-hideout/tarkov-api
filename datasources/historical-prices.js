const WorkerKV = require('../utils/worker-kv');

class historicalPricesAPI extends WorkerKV {
    constructor() {
        super('HISTORICAL_PRICES');
    }

    async getByItemId(itemId) {
        await this.init();
        if (!this.cache) {
            return Promise.reject(new Error('Historical prices cache is empty'));
        }
        if (!this.cache[itemId]) return [];
        return this.cache[itemId];
    }
}

module.exports = historicalPricesAPI;
