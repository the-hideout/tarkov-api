const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

class TraderInventoryAPI {
    constructor() {
        this.traderItemCache = false;
    }

    async init() {
        if (this.traderItemCache) {
            return true;
        }

        try {
            this.traderItemCache = await ITEM_DATA.get('TRADER_ITEMS', 'json');
        } catch (loadDataError) {
            console.error(loadDataError);
        }
    }

    async getItems(name) {
        await this.init();
        await itemsAPI.init();

        const returnItems = [];

        //console.log(this.itemCache['5b7c710788a4506dec015957'][0]);

        for (const i2 in this.traderItemCache) {
            const item = this.traderItemCache[i2];
            for (let i = 0; i < item.length; i = i + 1) {
                if (item[i]['source'] !== name) {
                    continue;
                }

                //console.log(item[i].id);

                returnItems.push({
                    ...item[i],
                    item: await itemsAPI.getItem(item[i].id),
                    minLevel: item[i].min_level,
                    questUnlockId: item[i].quest_unlock_id,
                })
            }
        }

        return returnItems;

        /* for (const traderID in this.itemCache) {
            console.log(`${traderID} | ${id}`);
            if (traderID !== id) {
                continue;
            }



            for (const item of traderItems) {


                const newItem = {
                    source: item.source,
                    price: item.price,
                    currency: item.currency,
                    requirements: [{
                        type: 'loyaltyLevel',
                        value: item.min_level,
                    }]
                };

                if (item.quest_unlock) {
                    newItem.requirements.push({
                        type: 'questCompleted',
                        value: Number(item.quest_unlock_id) || 1,
                    });
                }

                returnItems.push(newItem);
            }

            // for (let i = 0; i < traderItems[trader].length; i = i + 1) {
            //     returnItems.push({
            //         ...traderItems[trader][i],
            //         item: await itemsAPI.getItem(traderItems[trader][i].id),
            //         minLevel: traderItems[trader][i].min_level,
            //         questUnlockId: traderItems[trader][i].quest_unlock_id,
            //     })
            // }
        }

        return returnItems; */
    }

    async getByTraderName(name) {
        const traderInventory = await tradersAPI.getByName(name);

        if (!traderInventory) {
            return {};
        }
        
        traderInventory['name'] = name;

        traderInventory.items = await this.getItems(traderInventory['name']);

        return traderInventory;
    }
}

module.exports = TraderInventoryAPI;