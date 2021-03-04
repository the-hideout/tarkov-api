const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

class QuestsAPI {
    async getList() {
        const quests = await ITEM_DATA.get('QUEST_DATA', 'json');

        if(!quests){
            return {};
        }
        const returnData = [];

        for(const quest of quests){
            const parsedQuestData = {
                id: quest.questId,
                trader: tradersAPI.get(quest.traderId),
            }

            if(quest.items && quest.items.length > 0){
                parsedQuestData.items = quest.items.map((itemData) => {
                    return {
                        item: itemsAPI.getItem(itemData.id),
                        count: itemData.count,
                        foundInRaid: itemData.foundInRaid,
                    };
                });
            }

            returnData.push(parsedQuestData);
        }

        return returnData;
    }
}

module.exports = QuestsAPI
