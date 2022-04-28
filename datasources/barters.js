class BartersAPI {
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
            this.loading = ITEM_DATA.get('BARTER_DATA_V2', 'json');
            this.cache = await this.loading;
            this.loading = false;
        } catch (loadDataError){
            console.error(loadDataError);
        }
    }

    formatBarter(barter) {
        return {
            ...barter,
            source: barter.trader,
            requiredItems: barter.requiredItems.map((itemData) => {
                return {
                    ...itemData,
                    attributes: []
                };
            }),
            rewardItems: barter.rewardItems.map((itemData) => {
                return {
                    ...itemData,
                    attributes: []
                };
            }),
            requirements: barter.requirements
        };
    }

    async getList() {
        await this.init();

        if(!this.cache){
            return [];
        }

        return this.cache.data.map(barter => {
            return this.formatBarter(barter);
        });
    }

    async getBartersForItem(id) {
        await this.init();

        if(!this.cache){
            return [];
        }

        return this.cache.data.filter(barter => {
            for (const item of barter.rewardItems) {
                if (item.item === id) return true;
            }
            return false;
        }).map(barter => {
            return this.formatBarter(barter);
        });
    }

    async getBartersUsingItem(id) {
        await this.init();

        if(!this.cache){
            return [];
        }

        return this.cache.data.filter(barter => {
            for (const item of barter.requiredItems) {
                if (item.item === id) return true;
            }
            return false;
        }).map(barter => {
            return this.formatBarter(barter);
        });
    }

    async getBartersForTrader(id) {
        await this.init();

        if(!this.cache){
            return [];
        }

        return this.cache.data.filter(barter => {
            if (barter.trader_id === id) return true;
            return false;
        });
    }

    async getBartersForTraderLevel(id, level) {
        await this.init();

        if(!this.cache){
            return [];
        }

        return this.cache.data.filter(barter => {
            if (barter.trader_id === id && barter.level === level) return true;
            return false;
        });
    }
}

module.exports = BartersAPI
