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

  async getByItemId(itemId) {
    const returnItems = [];

    for(const trader in this.itemCache){
        for(let i = 0; i < this.itemCache[trader].length; i = i + 1){
            if(this.itemCache[trader][i].id !== itemId){
                continue;
            }

            const newItem ={
                source: trader,
                price: this.itemCache[trader][i].price,
                requirements: [{
                    type: 'loyaltyLevel',
                    value: this.itemCache[trader][i].min_level,
                }]
            };

            if(this.itemCache[trader][i].quest_unlock_id){
                newItem.requirements.push({
                    type: 'questCompleted',
                    value: this.itemCache[trader][i].quest_unlock_id,
                });
            }

            returnItems.push(newItem);
        }
    }

    return returnItems;
  }
}

module.exports = TraderInventoryAPI;
