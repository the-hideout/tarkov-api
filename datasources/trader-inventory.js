const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

class TraderInventoryAPI {
    constructor(){
        this.itemCache = false;
      }

      async init(){
        if(this.itemCache){
          return true;
        }

        try {
            this.itemCache = await ITEM_DATA.get('TRADER_ITEMS', 'json');
        } catch (loadDataError){
            console.error(loadDataError);
        }
      }

    // async getItems(name){
    //     const returnItems = [];

    //     for(const trader in traderItems){
    //         if(trader !== name){
    //             continue;
    //         }

    //         for(let i = 0; i < traderItems[trader].length; i = i + 1){
    //             returnItems.push({
    //                 ...traderItems[trader][i],
    //                 item: await itemsAPI.getItem(traderItems[trader][i].id),
    //                 minLevel: traderItems[trader][i].min_level,
    //                 questUnlockId: traderItems[trader][i].quest_unlock_id,
    //             })
    //         }
    //     }

    //     return returnItems;
    // }

//   async getByTraderName(name) {
//     const traderInventory = await tradersAPI.getByName(name);

//     if(!traderInventory){
//         return {};
//     }

//     traderInventory.items = await this.getItems(name);

//     return traderInventory;
//   }

  getByItemId(itemId) {
      if(!this.itemCache[itemId]){
          return [];
      }

      return this.itemCache[itemId].map((cacheData) => {
            const newItem = {
                source: cacheData.source,
                price: cacheData.price,
                currency: cacheData.currency,
                requirements: [{
                    type: 'loyaltyLevel',
                    value: cacheData.min_level,
                }]
            };

            if(cacheData.quest_unlock){
                newItem.requirements.push({
                    type: 'questCompleted',
                    value: Number(cacheData.quest_unlock_id) || 1,
                });
            }

            return newItem;
      });
  }
}

module.exports = TraderInventoryAPI;
