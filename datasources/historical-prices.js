class historicalPricesAPI {
    constructor(){
        this.cache = false;
        this.loading = false;
    }

    async init(){
        try {
            if (this.loading) await this.loading;
            if(this.cache){
                return true;
            }
            this.loading = ITEM_DATA.get('HISTORICAL_PRICES', 'json');
            this.cache = await this.loading;
            this.loading = false;
        } catch (error){
            console.error(error);
        }
    }

    async getByItemId(itemId) {
        await this.init();
        if (!this.cache || !this.cache[itemId]) return [];
        return this.cache[itemId];
    }
}

module.exports = historicalPricesAPI;
