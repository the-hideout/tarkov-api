const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

class BartersAPI {
  async getList() {
    const barters = await ITEM_DATA.get('BARTER_DATA_V2', 'json');

    if(!barters){
        return {};
    }

    const returnData = [];

    await itemsAPI.init();
    await tradersAPI.init();

    for(const barter of barters.data) {
        const barterData = {
            traderLevel: null,
            questUnlock: null,
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
        };
        let ll = 1;
        for (const req of barter.requirements) {
            if (req.type === 'loyaltyLevel') {
                ll = req.value;
            } else if (req.type === 'questCompleted') {
                // Add in questUnlock
            }
        }
        barterData.traderLevel = await tradersAPI.getByLevel(barter.trader_id, ll);
        returnData.push(barterData);
    }

    return returnData;
  }
}

module.exports = BartersAPI
