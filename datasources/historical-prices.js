const WorkerKV = require('../utils/worker-kv');

class historicalPricesAPI extends WorkerKV {
    constructor(dataSource) {
        super('historical_price_data', dataSource);
        this.defaultDays = 7;
        this.maxDays = 7;
        this.itemLimitDays = 2;
    }

    async getByItemId(context, itemId, days = this.defaultDays, halfResults = false) {
        await this.init(context);
        if (days > this.maxDays || days < 1) {
            const warningMessage = `Historical prices days argument of ${days} must be 1-${this.maxDays}; defaulting to ${this.defaultDays}.`;
            if (!context.warnings.some(warning => warning.message === warningMessage)) {
                context.warnings.push({message: warningMessage});
            }
        }
        if (!this.cache) {
            return Promise.reject(new Error('Historical prices cache is empty'));
        }
        if (!this.cache.historicalPricePoint[itemId]) return [];
        if (days === this.maxDays) {
            return this.cache.historicalPricePoint[itemId];
        }
        const cutoffTimestamp = new Date().setDate(new Date().getDate() - days);
        let dayFiltered = this.cache.historicalPricePoint[itemId].filter(hp => hp.timestamp >= cutoffTimestamp);
        if (halfResults) {
            dayFiltered = dayFiltered.filter((hp, index) => index % 2 === 0);
        }
        return dayFiltered;
    }
}

module.exports = historicalPricesAPI;
