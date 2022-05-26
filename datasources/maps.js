// datasource for ammo
class MapAPI {
    constructor(){
        this.cache = false;
        this.loading = false;
    }

    async init(){
        try {
            if (this.loading) {
                await this.loading;
            }
            if(this.cache){
                return true;
            }
            this.loading = ITEM_DATA.get('MAP_DATA_V2', 'json');
            this.cache = await this.loading;
            this.loading = false;
        } catch (error){
            console.error(error);
        }
        if (!this.cache) {
            return Promise.reject(new Error('Map cache failed to load'));
        }
    }

    async getList() {
        await this.init();
        return this.cache.data;
    }

    async get(id) {
        await this.init();
        for (const map of this.cache.data) {
            if (map.id === id || map.tarkovDataId === id) return map;
        }
        return Promise.reject(new Error(`No map found with id ${id}`));
    }
}

module.exports = MapAPI;
