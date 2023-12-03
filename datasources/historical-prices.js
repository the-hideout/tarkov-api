const WorkerKV = require('../utils/worker-kv');

const defaultDays = 7;
const maxDays = 30;

class historicalPricesAPI extends WorkerKV {
    constructor(dataSource) {
        super('historical_price_data', dataSource);
    }

    async getByItemId(context, itemId, days = 7) {
        await this.init(context);
        if (days > maxDays || days < 1) {
            const warningMessage = `Historical prices days argument of ${days} must be 1-${maxDays}; defaulting to ${defaultDays}.`;
            if (!context.warnings.some(warning => warning.message === warningMessage)) {
                context.warnings.push({message: warningMessage});
            }
        }
        if (!this.cache) {
            return Promise.reject(new Error('Historical prices cache is empty'));
        }
        if (!this.cache.historicalPricePoint[itemId]) return [];
        if (days === 30) {
            return this.cache.historicalPricePoint[itemId];
        }
        const cutoffTimestamp = new Date().setDate(new Date().getDate() - days);
        return this.cache.historicalPricePoint[itemId].filter(hp => hp.timestamp >= cutoffTimestamp);
    }
}

module.exports = historicalPricesAPI;
