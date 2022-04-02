const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

class CraftsAPI {
  async getList() {
    const crafts = await ITEM_DATA.get('CRAFT_DATA', 'json');

    if(!crafts){
        return {};
    }

    await itemsAPI.init();

    const returnData = [];

    for(const craft of crafts.data){
        returnData.push({
            duration: craft.duration,
            source: craft.station,
            requiredItems: craft.requiredItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                    attributes: []
                };
            }),
            rewardItems: craft.rewardItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                    attributes: []
                };
            })
        });
    }

    return returnData;
  }
}

module.exports = CraftsAPI
