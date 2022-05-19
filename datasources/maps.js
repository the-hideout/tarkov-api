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
        this.loading = ITEM_DATA.get('MAP_DATA', 'json');
        this.cache = await this.loading;
        this.loading = false;
    } catch (error){
        console.error(error);
    }
  }

  async getList() {
    await this.init();

    if (!this.cache) {
      return [];
    }
    return this.cache.data;
  }

  async get(id) {
    await this.init();

    if(!this.cache){
      return {};
    }

    for (const map of this.cache.data) {
      if (map.id === id || map.tarkovDataId === id) return map;
    }
  }
}

module.exports = MapAPI
