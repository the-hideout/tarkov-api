class TraderInventoryAPI {
    constructor(){
        this.cache = false;
        this.traderCache = false;
        this.loading = false;
    }

    async init(){
        try {
            if (this.loading) await this.loading;
            if (this.cache){
                return true;
            }
            this.loading = ITEM_DATA.get('TRADER_ITEMS_V2', 'json');
            this.cache = await this.loading;
            this.loading = false;
        } catch (loadDataError){
            console.error(loadDataError);
        }
        if (!this.cache) {
            return Promise.reject(new Error('Trader inventory cache failed to load'));
        }
    }

    async initTraderCache() {
        await this.init();
        if (this.traderCache) {
            return true;
        }

        try {
            const traderCache = {};
            for (const id in this.cache) {
                const itemOffers = this.cache[id];
                for (const offer of itemOffers) {
                    if (!traderCache[offer.vendor.trader_id]) traderCache[offer.vendor.trader_id] = [];
                    traderCache[offer.vendor.trader_id].push(offer);
                }
            }
            this.traderCache = traderCache;
        } catch (error){
            return Promise.reject(error);
        }
    }

    async getByItemId(itemId) {
        await this.init();
        if(!this.cache[itemId]){
            return [];
        }
        return this.cache[itemId];
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
