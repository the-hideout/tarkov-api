class BartersAPI {
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
                        resolve()
                      } else {
                        setTimeout(isDone, 5)
                      }
                    }
                    isDone()
                });
            }
            if(this.cache){
                return true;
            }
            this.loading = ITEM_DATA.get('BARTER_DATA_V2', 'json');
            this.cache = await this.loading;
            this.loading = false;
        } catch (loadDataError){
            console.error(loadDataError);
        }
        if(!this.cache){
            return Promise.reject(new Error('Barter cache failed to load'));
        }
    }

    async getList() {
        await this.init();
        return this.cache.data;
    }

    async getBartersForItem(id) {
        await this.init();
        return this.cache.data.filter(barter => {
            for (const item of barter.rewardItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getBartersUsingItem(id) {
        await this.init();
        return this.cache.data.filter(barter => {
            for (const item of barter.requiredItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getBartersForTrader(id) {
        await this.init();
        return this.cache.data.filter(barter => {
            if (barter.trader_id === id) return true;
            return false;
        });
    }

    async getBartersForTraderLevel(id, level) {
        await this.init();
        return this.cache.data.filter(barter => {
            if (barter.trader_id === id && barter.level === level) return true;
            return false;
        });
    }
}

module.exports = BartersAPI;
