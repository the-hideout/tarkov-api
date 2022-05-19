class historicalPricesAPI {
    constructor(){
        this.itemCache = {};
    }

    async getByItemId(itemId) {
        if(this.itemCache[itemId]){
            return this.itemCache[itemId];
        }

        try {
            const cacheResponse = await ITEM_DATA.get(`historical-prices-${itemId}`, 'json');

            if(cacheResponse === null){
                return [];
            }

            this.itemCache[itemId] = cacheResponse;
        } catch (loadDataError){
            console.error(loadDataError);

            return [];
        }

        return this.itemCache[itemId];
    }
}

module.exports = historicalPricesAPI;
