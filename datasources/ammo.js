// datasource for ammo
class AmmoAPI {
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
            this.loading = ITEM_DATA.get('AMMO_DATA', 'json');
            this.cache = await this.loading;
            this.loading = false;
        } catch (error){
            console.error(error);
        }
        if(!this.cache){
            return Promise.reject(new Error('Ammo cache failed to load'));
        }
    }
    async getList() {
        await this.init();
        return this.cache.data;
    }
}

module.exports = AmmoAPI;
