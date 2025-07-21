import { GraphQLError } from 'graphql';

import WorkerKVSplit from '../utils/worker-kv-split.mjs';

class historicalPricesAPI extends WorkerKVSplit {
    constructor(dataSource) {
        super('historical_price_data', dataSource);
        this.addGameMode('pve');
        this.defaultDays = 7;
        this.maxDays = 30;
        this.itemLimitDays = 2;
    }

    async getByItemId(context, info, itemId, days = this.defaultDays, halfResults = false) {
        const { cache } = await this.getCache(context, info, itemId);
        if (!cache) {
            return Promise.reject(new GraphQLError('Historical prices cache is empty'));
        }
        
        if (days > this.maxDays || days < 1) {
            const warningMessage = `Historical prices days argument of ${days} must be 1-${this.maxDays}; defaulting to ${this.defaultDays}.`;
            days = this.defaultDays;
            if (!context.warnings.some(warning => warning.message === warningMessage)) {
                context.warnings.push({message: warningMessage});
            }
        }
        
        let prices = cache.historicalPricePoint[itemId];
        if (!prices) {
            return [];
        } 
        if (days === this.maxDays) {
            return prices;
        }
        const cutoffTimestamp = new Date().setDate(new Date().getDate() - days);
        let dayFiltered = prices.filter(hp => hp.timestamp >= cutoffTimestamp);
        if (halfResults) {
            dayFiltered = dayFiltered.filter((hp, index) => index % 2 === 0);
        }
        return dayFiltered;
    }
}

export default historicalPricesAPI;
