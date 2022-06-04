class historicalPricesAPI {
    constructor(){
        this.cache = false;
        this.loading = false;
    }

    async init(){
        try {
            if (this.loading) {
                return new Promise((resolve) => {
                    const isDone = () => {
                        if (this.loading === false) {
                            resolve();
                        } else {
                            setTimeout(isDone, 5);
                        }
                    }
                    isDone();
                });
            }
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
        if (!this.cache) {
            return Promise.reject(new Error('Historical prices cache is empty'));
        }
        if (!this.cache[itemId]) return [];
        return this.cache[itemId];
    }
}

module.exports = historicalPricesAPI;
