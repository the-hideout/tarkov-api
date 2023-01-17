const WorkerKV = require('../utils/worker-kv');

class TraderInventoryAPI extends WorkerKV {
    constructor(dataSource) {
        super('trader_price_data', dataSource);
        this.traderCache = false;
        this.refreshInterval = 1000 * 60 * 60 * 12;
    }

    async initTraderCache(requestId) {
        await this.init(requestId);
        if (this.traderCache) {
            return true;
        }

        try {
            const traderCache = {};
            for (const itemOffers of Object.values(this.cache.data)) {
                for (const offer of itemOffers) {
                    if (!traderCache[offer.vendor.trader_id]) traderCache[offer.vendor.trader_id] = [];
                    traderCache[offer.vendor.trader_id].push(offer);
                }
            }
            this.traderCache = traderCache;
        } catch (error) {
            return Promise.reject(error);
        }
    }

    async getByItemId(requestId, itemId) {
        await this.init(requestId);
        if (!this.cache.data[itemId]) {
            return [];
        }
        return this.cache.data[itemId];
    }

    async getPricesForTrader(requestId, traderId) {
        await this.initTraderCache(requestId);
        if (!this.traderCache[traderId]) return [];
        return this.traderCache[traderId];
    }

    async getPricesForTraderLevel(requestId, traderId, level) {
        await this.initTraderCache(requestId);
        if (!this.traderCache[traderId]) return [];
        return this.traderCache[traderId].filter(offer => {
            return offer.vendor.traderLevel === level;
        });
    }
}

module.exports = TraderInventoryAPI;
