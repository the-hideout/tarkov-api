const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

class CraftsAPI {
  async getList() {
    const crafts = await ITEM_DATA.get('CRAFT_DATA', 'json');

    if(!crafts){
        return {};
    }

    const returnData = [];

    for(const craft of crafts.data){
        returnData.push({
            time: craft.time,
            source: craft.station,
            requiredItems: craft.requiredItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                };
            }),
            rewardItems: craft.rewardItems.map((itemData) => {
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

module.exports = CraftsAPI
