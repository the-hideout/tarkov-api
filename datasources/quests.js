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
                ...quest,
                giver: tradersAPI.getByName(quest.giver),
                turnin: tradersAPI.getByName(quest.turnin),
                requirements: quest.require,
                wikiLink: quest.wiki,
                reputation: quest.reputation.map((reputationData) => {
                    return {
                        trader: tradersAPI.getByName(reputationData.trader),
                        amount: reputationData.rep,
                    };
                }),
                objectives: quest.objectives.map((objectiveData) => {
                    const formattedObjective = {
                        ...objectiveData,
                    };

                    if(objectiveData.type === 'collect' || objectiveData.type === 'find'){
                        formattedObjective.targetItem = itemsAPI.getItem(formattedObjective.target);
                    }

                    return formattedObjective;
                }),
            };

            returnData.push(parsedQuestData);
        }

        return returnData;
    }
}

module.exports = QuestsAPI
