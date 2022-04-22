// datasource for crafts 
class CraftsAPI {
    constructor(){
        this.caache = false;
    }

    async init(){
        if(this.cache){
            return true;
        }

        try {
            this.cache = await ITEM_DATA.get('CRAFT_DATA_V2', 'json');
        } catch (loadDataError){
            console.error(loadDataError);
        }
    }

    async getList() {
        await this.init();

        if(!this.cache){
            return [];
        }

        return this.cache.data;
    }

    async getCraftsForItem(id) {
        await this.init();

        if(!this.cache){
            return [];
        }

        return this.cache.data.filter(craft => {
            for (const item of craft.rewardItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getCraftsUsingItem(id) {
        await this.init();

        if(!this.cache){
            return [];
        }

        return this.cache.data.filter(craft => {
            for (const item of craft.requiredItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }
}

module.exports = CraftsAPI
