// datasource for ammo
const buildAttributes = require('./build-attributes');

class AmmoAPI {
  constructor(){
    this.cache = false;
  }

  async init(){
    if(this.cache){
      return true;
    }

    try {
        this.cache = await ITEM_DATA.get('AMMO_DATA', 'json');
    } catch (error){
        console.error(error);
    }
  }
  async getList() {
    await this.init();

    if(!this.cache){
      return {};
    }

    return this.cache.data.map(ammo => {
      const ammoData = {
        ...ammo,
        item: ammo.id,
        heavyBleedModifier: ammo.heavyBleed,
        lightBleedModifier: ammo.lightBleed
      };
      ammoData.attributes = buildAttributes(ammoData, [
        'id',
        'item',
        'name',
        'shortName',
        'heavyBleed',
        'lightBleed'
      ]);
      return ammoData;
    });
  }
}

module.exports = AmmoAPI
