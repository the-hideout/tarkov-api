class ItemsAPI {
  constructor(){
    this.itemCache = {};
  }

  async init(){
    if(this.itemCache){
      return true;
    }

    this.itemCache = await ITEM_DATA.get('ITEM_CACHE', 'json');
  }

  async getItem(id) {
    let item = this.itemCache[id];

    if(!item){
      item = await ITEM_DATA.get(id, 'json');
    }

    if(!item){
        return {};
    }

    if(typeof item.avg24hPrice === 'undefined' && item.avg24Price){
        item.avg24hPrice = item.avg24Price;
    }

    item.iconLink = item.icon_link;
    item.imageLink = item.image_link;
    item.basePrice = item.base_price;
    item.shortName = item.shortname;
    item.wikiLink = item.wiki_link;
    item.normalizedName = item.normalized_name;

    if(item.properties){
        if(item.properties.Accuracy){
            item.accuracyModifier = item.properties.Accuracy;
        }

        if(item.properties.Recoil){
            item.recoilModifier = item.properties.Recoil;
        }

        if(item.properties.Ergonomics){
            item.ergonomicsModifier = item.properties.Ergonomics;
        }
    }

    return item;
  }
}

module.exports = ItemsAPI
