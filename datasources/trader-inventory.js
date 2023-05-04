const WorkerKV = require('../utils/worker-kv');

class TraderInventoryAPI extends WorkerKV {
    constructor(dataSource) {
        super('trader_price_data', dataSource);
        this.traderCache = false;
    }

    async initTraderCache() {
        await this.init();
        if (this.traderCache) {
            return true;
        }

        try {
            const traderCache = {};
            for (const itemOffers of Object.values(this.cache.TraderCashOffer)) {
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

    async getByItemId(itemId) {
        await this.init();
        if (!this.cache.TraderCashOffer[itemId]) {
            return [];
        }
        return this.cache.TraderCashOffer[itemId];
    }

    async getPricesForTrader(traderId) {
        await this.initTraderCache();
        if (!this.traderCache[traderId]) return [];
        return this.traderCache[traderId];
    }

    async getPricesForTraderLevel(traderId, level) {
        await this.initTraderCache();
        if (!this.traderCache[traderId]) return [];
        return this.traderCache[traderId].filter(offer => {
            return offer.vendor.traderLevel === level;
        });
    }
}

module.exports = TraderInventoryAPI;
