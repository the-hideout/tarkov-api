const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

class CraftsAPI {
    constructor() {
        this.craftList = false;
    }
    async getList() {
        if (this.craftList) {
            return this.craftList;
        }

        const crafts = await ITEM_DATA.get('CRAFT_DATA', 'json');

        if (!crafts) {
            return {};
        }

        await itemsAPI.init();

        const returnData = [];

        for (const craft of crafts.data) {
            returnData.push({
                duration: craft.duration,
                source: craft.station,
                requiredItems: await Promise.all(craft.requiredItems.map(async (itemData) => {
                    return {
                        item: await itemsAPI.getItem(itemData.id),
                        count: itemData.count,
                        quantity: itemData.count,
                    };
                })),
                rewardItems: await Promise.all(craft.rewardItems.map(async (itemData) => {
                    return {
                        item: await itemsAPI.getItem(itemData.id),
                        count: itemData.count,
                        quantity: itemData.count,
                    };
                }))
            });
        }

        this.craftList = returnData;

        return returnData;
    }

    async getCraftsForItemID(itemID) {
        const crafts = await this.getList();

        const results = [];

        for (const craft of crafts) {
            console.log(craft.requiredItems);
            for (const i in craft.requiredItems) {
                //console.log(`${requiredItem.item.id} | ${itemID}`);
                if (craft.requiredItems[i].item.id === itemID) {
                    results.push(craft);
                }
            }

            for (const i in craft.rewardItems) {

                if (craft.rewardItems[i].item.id === itemID) {
                    results.push(craft);
                }
            }
        }

        return results;
    }
}

module.exports = CraftsAPI