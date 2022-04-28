//const TradersAPI = require('./traders');
//const tradersAPI = new TradersAPI();

class TraderInventoryAPI {
    constructor(){
        this.itemCache = false;
        this.traderCache = false;
        this.loading = false;
    }

    async init(){
        try {
            if (this.loading) await this.loading;
            if (this.itemCache){
                return true;
            }
            this.loading = ITEM_DATA.get('TRADER_ITEMS_V2', 'json');
            this.itemCache = await this.loading;
            this.loading = false;
            /*const curr = await ITEM_DATA.get('CURRENCY_PRICES', 'json');
            for (const id in curr) {
                this.itemCache[id] = curr[id];
            }*/
        } catch (loadDataError){
            console.error(loadDataError);
        }
    }

    async initTraderCache() {
        await this.init();
        if (this.traderCache) {
            return true;
        }

        try {
            const traderCache = {};
            for (const id in this.itemCache) {
                const itemOffers = this.itemCache[id];
                for (const offer of itemOffers) {
                    if (!traderCache[offer.vendor.trader_id]) traderCache[offer.vendor.trader_id] = [];
                    traderCache[offer.vendor.trader_id].push(offer);
                }
            }
            this.traderCache = traderCache;
        } catch (error){
            console.error(error);
        }
    }

    // async getItems(name){
    //     const returnItems = [];

    //     for(const trader in traderItems){
    //         if(trader !== name){
    //             continue;
    //         }

    //         for(let i = 0; i < traderItems[trader].length; i = i + 1){
    //             returnItems.push({
    //                 ...traderItems[trader][i],
    //                 item: await itemsAPI.getItem(traderItems[trader][i].id),
    //                 minLevel: traderItems[trader][i].min_level,
    //                 questUnlockId: traderItems[trader][i].quest_unlock_id,
    //             })
    //         }
    //     }

    //     return returnItems;
    // }

//   async getByTraderName(name) {
//     const traderInventory = await tradersAPI.getByName(name);

//     if(!traderInventory){
//         return {};
//     }

//     traderInventory.items = await this.getItems(name);

//     return traderInventory;
//   }

    async getByItemId(itemId) {
        await this.init();
        if(!this.itemCache[itemId]){
            return [];
        }

        return this.itemCache[itemId];
        /*return this.itemCache[itemId].map((cacheData) => {
                const newItem = {
                    ...cacheData,
                    requirements: [{
                        type: 'loyaltyLevel',
                        value: cacheData.minLevel,
                    }]
                };

                if(cacheData.quest_unlock){
                    newItem.requirements.push({
                        type: 'questCompleted',
                        value: Number(cacheData.quest_unlock_id) || 1,
                        stringValue: cacheData.taskUnlock
                    });
                }

                return newItem;
        });*/
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
