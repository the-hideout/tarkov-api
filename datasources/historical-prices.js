class historicalPricesAPI {
    constructor(){
        this.itemCache = {};
    }

    async getByItemId(itemId) {
        if(this.itemCache[itemId]){
            return this.itemCache[itemId];
        }

        try {
            this.itemCache[itemId] = await ITEM_DATA.get(`historical-prices-${itemId}`, 'json');
        } catch (loadDataError){
            console.error(loadDataError);

            return [];
        }

        return this.itemCache[itemId];
    }
}

module.exports = historicalPricesAPI;
