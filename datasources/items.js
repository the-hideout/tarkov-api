const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

const TraderInventoryAPI = require('./trader-inventory');
const traderInventoryAPI = new TraderInventoryAPI();

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

    traderInventoryAPI.init();

    try {
        this.itemCache = await ITEM_DATA.get('ITEM_CACHE', 'json');
    } catch (loadDataError){
        console.error(loadDataError);
    }
  }

  async formatItem(rawItem) {
    const item = {
        ...rawItem,
    };

    if(typeof item.avg24hPrice === 'undefined' && item.avg24Price){
        item.avg24hPrice = item.avg24Price;
    }

    item.iconLink = item.icon_link;
    item.gridImageLink = item.grid_image_link;
    item.imageLink = item.image_link;
    item.basePrice = item.base_price;
    item.shortName = item.shortname;
    item.wikiLink = item.wiki_link;
    item.normalizedName = item.normalized_name;
    item.link = `https://tarkov-tools.com/item/${item.normalizedName}`;

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

        if(item.properties.grid && item.properties.grid.totalSize > 0){
            item.hasGrid = true;
        }

        if(item.properties.BlocksEarpiece){
            item.blocksHeadphones = true;
        }
    }

    item.formattedTypes = item.types.map(type => camelCase(type));
    item.types = item.formattedTypes;

    item.traderPrices = item.traderPrices.map((traderPrice) => {
        const targetTrader = tradersAPI.getByName(traderPrice.name);
        return {
            price: traderPrice.price,
            trader: targetTrader,
        };
    });

    item.sellFor = [
        ...item.traderPrices.map((traderPrice) => {
            return {
                price: traderPrice.price,
                source: traderPrice.trader.name.toLowerCase(),
                requirements: [],
            };
        }),
    ];

    if(!item.types.includes('noFlea')){
        item.sellFor.push({
            price: item.avg24hPrice,
            source: 'fleaMarket',
            currency: 'RUB',
            requirements: [{
                type: 'playerLevel',
                value: 20,
            }],
        });
    }

    item.buyFor = [
        ...traderInventoryAPI.getByItemId(item.id),
    ];

    if(item.avg24hPrice > 0){
        item.buyFor.push({
            price: item.avg24hPrice,
            source: 'fleaMarket',
            currency: 'RUB',
            requirements: [{
                type: 'playerLevel',
                value: 20,
            }],
        });
    }

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

    return await this.formatItem(item);
  }

  getItemsByType(type) {
    return Object.values(this.itemCache)
        .filter((rawItem) => {
            return rawItem.types.includes(camelCaseToDash(type)) || type === 'any';
        })
        .map(async (rawItem) => {
            return await this.formatItem(rawItem);
        });
  }

  getItemsByName(name) {
    const searchString = name.toLowerCase();

    return Object.values(this.itemCache)
        .filter((rawItem) => {
            return rawItem.name.toLowerCase().includes(searchString) || rawItem.shortname.toLowerCase().includes(searchString);
        })
        .map(async (rawItem) => {
            return await this.formatItem(rawItem);
        });
  }
}

module.exports = ItemsAPI
