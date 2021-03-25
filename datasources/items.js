function camelCase(input) {
    return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
}

function camelCaseToDash(input) {
    return input.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}

class ItemsAPI {
  constructor(){
    this.itemCache = false;
  }

  async init(){
    if(this.itemCache){
      return true;
    }

    try {
        this.itemCache = await ITEM_DATA.get('ITEM_CACHE', 'json');
    } catch (loadDataError){
        console.error(loadDataError);
    }
  }

  formatItem(rawItem) {
    const item = {
        ...rawItem,
    };
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

    item.formattedTypes = item.types.map(type => camelCase(type));
    item.types = item.formattedTypes;

    return item;
  }

  async getItem(id) {
    let item = this.itemCache[id];

    if(!item){
      item = await ITEM_DATA.get(id, 'json');
    }

    if(!item){
        return {};
    }

    return this.formatItem(item);
  }

  getItemsByType(type) {
    return Object.values(this.itemCache)
        .filter((rawItem) => {
            return rawItem.types.includes(camelCaseToDash(type));
        })
        .map((rawItem) => {
            return this.formatItem(rawItem);
        });
  }
}

module.exports = ItemsAPI
