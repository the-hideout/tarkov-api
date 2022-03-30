const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

class BartersAPI {
    constructor() {
        this.barterList = false;
    }
  async getList() {
    if (this.barterList) {
        return this.craftLbarterListist;
    }

    const barters = await ITEM_DATA.get('BARTER_DATA', 'json');

    if(!barters){
        return {};
    }

    const returnData = [];

    await itemsAPI.init();

    for(const barter of barters.data){
        returnData.push({
            source: barter.trader,
            requiredItems: await Promise.all(barter.requiredItems.map(async (itemData) => {
                return {
                    item: await itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                };
            })),
            rewardItems: await Promise.all(barter.rewardItems.map(async (itemData) => {
                return {
                    item: await itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                };
            }))
        });
    }

    this.barterList = returnData;

    return returnData;
  }

  async getBartersForItemID(itemID) {
    const barters = await this.getList();

    const results = [];

    for (const barter of barters) {
        console.log(barter.requiredItems);
        for (const i in barter.requiredItems) {
            //console.log(`${requiredItem.item.id} | ${itemID}`);
            if (barter.requiredItems[i].item.id === itemID) {
                results.push(barter);
            }
        }

        for (const i in barter.rewardItems) {

            if (barter.rewardItems[i].item.id === itemID) {
                results.push(barter);
            }
        }
    }

    return results;
}
}

module.exports = BartersAPI
