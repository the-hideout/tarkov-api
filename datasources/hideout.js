const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

class HideoutAPI {
  async getList() {
    const hideoutData = await ITEM_DATA.get('HIDEOUT_DATA', 'json');

    if(!hideoutData){
        return {};
    }

    await itemsAPI.init();

    const returnData = [];

    for(const hideoutModule of hideoutData.data){
        const newRequirement = {
            name: hideoutModule.module,
            level: hideoutModule.level,
            itemRequirements: await Promise.all(hideoutModule.require.map(async (hideoutRequirement) => {
                if(hideoutRequirement.type !== 'item'){
                    return false;
                }

                return {
                    item: await itemsAPI.getItem(hideoutRequirement.name),
                    quantity: hideoutRequirement.quantity,
                };
            })),
        };

        newRequirement.itemRequirements = newRequirement.itemRequirements.filter(Boolean);

        returnData.push(newRequirement);
    }

    return returnData;
  }
}

module.exports = HideoutAPI
