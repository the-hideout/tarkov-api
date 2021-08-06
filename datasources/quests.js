const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

class QuestsAPI {
    async getList() {
        const quests = await ITEM_DATA.get('QUEST_DATA', 'json');

        await itemsAPI.init();

        if(!quests){
            return {};
        }
        const returnData = [];

        for(const quest of quests){
            const parsedQuestData = {
                ...quest,
                giver: tradersAPI.getByDataId(quest.giver),
                turnin: tradersAPI.getByDataId(quest.turnin),
                requirements: quest.require,
                wikiLink: quest.wiki,
                reputation: quest.reputation.map((reputationData) => {
                    return {
                        trader: tradersAPI.getByName(reputationData.trader),
                        amount: reputationData.rep,
                    };
                }),
                objectives: quest.objectives.map(async (objectiveData) => {
                    const formattedObjective = {
                        ...objectiveData,
                    };

                    if(objectiveData.type === 'collect' || objectiveData.type === 'find' || objectiveData.type === 'place'){
                        formattedObjective.targetItem = await itemsAPI.getItem(formattedObjective.target);

                        if(!formattedObjective.targetItem.id){
                            console.log(`${quest.id} - ${formattedObjective.target}`);
                        }
                    }

                    if(!Array.isArray(formattedObjective.target)){
                        formattedObjective.target = [formattedObjective.target];
                    }

                    return formattedObjective;
                }),
            };

            parsedQuestData.requirements.quests = parsedQuestData.requirements.quests.map((stringOrArray) => {
                if(Array.isArray(stringOrArray)){
                    return stringOrArray;
                }

                return [stringOrArray];
            });

            returnData.push(parsedQuestData);
        }

        return returnData;
    }
}

module.exports = QuestsAPI
