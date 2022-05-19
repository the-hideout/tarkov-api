const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

class BartersAPI {
  async getList() {
    const barters = await ITEM_DATA.get('BARTER_DATA', 'json');

    if(!barters){
        return {};
    }

    const returnData = [];

    await itemsAPI.init();

    for(const barter of barters.data){
        returnData.push({
            source: barter.trader,
            sourceName: barter.sourceName,
            requiredItems: barter.requiredItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                    attributes: itemData.attributes
                };
            }),
            rewardItems: barter.rewardItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                    attributes: []
                };
            }),
            requirements: barter.requirements
        });
    }

    return returnData;
  }
}

module.exports = BartersAPI
