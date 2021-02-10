const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

class BartersAPI {
  async getList() {
    const barters = await ITEM_DATA.get('BARTER_DATA', 'json');

    if(!barters){
        return {};
    }

    const returnData = [];

    for(const barter of barters.data){
        returnData.push({
            source: barter.trader,
            requiredItems: barter.requiredItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                };
            }),
            rewardItems: barter.rewardItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                };
            })
        });
    }

    return returnData;
  }
}

module.exports = BartersAPI
