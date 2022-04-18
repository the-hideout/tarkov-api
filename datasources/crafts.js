// datasource for crafts

const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

const HideoutNewAPI = require('./hideout-new');
const hideoutAPI = new HideoutNewAPI();

class CraftsAPI {
  async getList() {
    const crafts = await ITEM_DATA.get('CRAFT_DATA_TEST', 'json');

    if(!crafts){
        return {};
    }

    await itemsAPI.init();
    await hideoutAPI.init();

    const returnData = await Promise.all(crafts.data.map(async craft => {
        return {
            id: craft.id,
            duration: craft.duration,
            source: craft.station,
            sourceName: craft.sourceName,
            stationLevel: await hideoutAPI.getModuleByLevel(craft.station_id, craft.level),
            requiredItems: craft.requiredItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                    attributes: itemData.attributes
                };
            }),
            rewardItems: craft.rewardItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                    attributes: itemData.attributes
                };
            }),
            requirements: craft.requirements
        }
    }));

    /*for(const craft of crafts.data){
        returnData.push({
            id: craft.id,
            duration: craft.duration,
            source: craft.station,
            sourceName: craft.sourceName,
            stationLevel: hideoutAPI.getModuleByLevel(craft.station_id, craft.level),
            requiredItems: craft.requiredItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                    attributes: itemData.attributes
                };
            }),
            rewardItems: craft.rewardItems.map((itemData) => {
                return {
                    item: itemsAPI.getItem(itemData.id),
                    count: itemData.count,
                    quantity: itemData.count,
                    attributes: itemData.attributes
                };
            }),
            requirements: craft.requirements
        });
    }*/

    return returnData;
  }
}

module.exports = CraftsAPI
