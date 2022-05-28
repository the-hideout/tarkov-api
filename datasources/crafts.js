// datasource for crafts 
class CraftsAPI {
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
            this.loading = ITEM_DATA.get('CRAFT_DATA_V2', 'json');
            this.cache = await this.loading;
            this.loading = false;
        } catch (loadDataError){
            console.error(loadDataError);
        }
        if(!this.cache){
            return Promise.reject(new Error('Crafts cache failed to load'));
        }
    }

    async getList() {
        await this.init();
        return this.cache.data;
    }

    async getCraftsForItem(id) {
        await this.init();
        return this.cache.data.filter(craft => {
            for (const item of craft.rewardItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getCraftsUsingItem(id) {
        await this.init();
        return this.cache.data.filter(craft => {
            for (const item of craft.requiredItems) {
                if (item.item === id) return true;
            }
            return false;
        });
    }

    async getCraftsForStation(id) {
        await this.init();
        return this.cache.data.filter(craft => {
            if (craft.station_id === id) return true;
            return false;
        });
    }

    async getCraftsForStationLevel(id, level) {
        await this.init();
        return this.cache.data.filter(craft => {
            if (craft.station_id === id && craft.level === level) return true;
            return false;
        });
    }
}

module.exports = CraftsAPI;
