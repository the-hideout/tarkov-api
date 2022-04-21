class BartersAPI {
    constructor(){
        this.caache = false;
    }

    async init(){
        if(this.cache){
            return true;
        }

        try {
            this.cache = await ITEM_DATA.get('BARTER_DATA_V2', 'json');
        } catch (loadDataError){
            console.error(loadDataError);
        }
    }

    async getList() {
        await this.init();

        if(!this.cache){
            return {};
        }

        return this.cache.data.map(barter => {
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
        });
    }
}

module.exports = BartersAPI
