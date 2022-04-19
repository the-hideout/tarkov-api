const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

class TasksAPI {
    constructor(){
        this.cache = false;
        this.taskList = false;
    }

    async init(){
        if(this.cache){
          return true;
        }
    
        await itemsAPI.init();
        await tradersAPI.init();
    
        try {
            this.cache = await ITEM_DATA.get('QUEST_DATA_V2', 'json');
        } catch (error){
            console.error(error);
        }
    }

    async formatTask(rawTask) {
        return {
            id: rawTask.id,
            name: rawTask.name,
            trader: await tradersAPI.get(rawTask.trader_id),
            locationName: rawTask.locationName,
            experience: rawTask.experience,
            wikiLink: rawTask.wiki_link,
            minPlayerLevel: rawTask.requrements.level,
            taskRequirements: await Promise.all(rawTask.requirements.quests.map(async (tReq) => {
                return {
                    task: await this.get(tReq.quest_id),
                    status: tReq.status
                }
            })),
            traderLevelRequirements: await Promise.all(rawTask.requirements.traderLoyalty.map(async (llReq) => {
                return await tradersAPI.getByLevel(llReq.trader_id, llReq.level)
            })),
            objectives: await Promise.all(rawTask.objectives.map(async (obj) => {
                const objective = {
                    ...obj
                };
                if (obj.type === 'findQuestItem' || obj.type === 'giveQuestItem' || obj.type === 'plantQuestItem') {
                    objective.questItem = {
                        id: obj.item_id,
                        name: obj.item_name,
                    };
                    delete objective.item_id;
                    delete objective.item_name;
                } else if (obj.type === 'findItem' || obj.type === 'giveItem' || obj.type === 'plantItem') {
                    objective.item = await itemsAPI.getItem(obj.item_id);
                    delete objective.item_id;
                    delete objective.item_name;
                } else if (obj.type === 'mark') {
                    objective.markerItem = await itemsAPI.getItem(obj.item_id);
                    delete objective.item_id;
                    delete objective.item_name;
                } else if (obj.type === 'extract') {
                    // handled via merge
                } else if (obj.type === 'skill') {
                    objective.skillLevel = {
                        name: obj.skillName,
                        level: obj.level
                    }
                    delete objective.skillName;
                    delete objective.level;
                } else if (obj.type === 'traderLoyalty') {
                    objective.traderLevel = await tradersAPI.getByLevel(obj.trader_id, obj.level);
                    delete objective.trader_id;
                    delete objective.trader_name;
                    delete objective.level;
                } else if (obj.type === 'quest') {
                    objective.task = await this.get(obj.quest_id);
                    objective.status = obj.status;
                    delete objective.quest_id;
                    delete objective.quest_name;
                } else if (obj.type === 'level') {
                    // handled via merge
                } else if (obj.type === 'experience') {
                    // handled via merge
                } else if (obj.type === 'shoot') {
                    objective.usingWeapon = await Promise.all(obj.usingWeapon.map(async (item) => {
                        return await itemsAPI.getItem(item.id);
                    }));
                    objective.usingWeaponMods = await Promise.all(obj.usingWeaponMods.map(async (itemGroup) => {
                        return await Promise.all(itemGroup.map(async (item) => {
                            return await itemsAPI.getItem(item.id);
                        }));
                    }));
                } else if (obj.type === 'buildWeapon') {
                    objective.item = await itemsAPI.getItem(obj.item_id);
                    delete objective.item_id;
                    delete objective.item_name;
                    objective.containsAll = await Promise.all(obj.containsAll.map(async (item) => {
                        return await itemsAPI.getItem(item.id);
                    }));
                    objective.containsOne = await Promise.all(obj.containsOne.map(async (item) => {
                        return await itemsAPI.getItem(item.id);
                    }));
                }
                return objective;
            })),
            startRewards: this.formatRewards(rawTask.startRewards),
            finishRewards: this.formatRewards(rawTask.finishRewards)
        };
    }

    async formatRewards(rewards) {
        return {
            traderStanding: await Promise.all(rewards.traderStanding.map(async (standing) => {
                return {
                    trader: await tradersAPI.get(standing.id),
                    standing: standing.standing
                };
            })),
            item: await Promise.all(rewards.item.map(async (item) => {
                return {
                    item: await itemsAPI.getItem(item.item_id, item.contains),
                    count: item.count,
                    quantity: item.count,
                    attributes: []
                }
            })),
            offerUnlock: await Promise.all(rewards.offerUnlock.map(async (offer) => {
                return {
                    id: offer.offer_id,
                    traderLevel: await tradersAPI.getByLevel(offer.trader_id, offer.min_level),
                    item: await itemsAPI.get(offer.item_id, offer.contains)
                };
            })),
            skill: rewards.skill,
            traderUnlock: await Promise.all(rewards.traderUnlock.map(async (trader) => {
                return await tradersAPI.get(trader.trader_id);
            }))
        };
    }

    async getList() {
        await this.init();
        if(this.taskList){
            return this.tastList;
        }

        if(!this.cache){
            return [];
        }

        const returnData = await Promise.all(this.cache.data.map(rawTask => {
            return this.formatTask(rawTask);
        }));


        this.taskList = returnData;
        return returnData;
    }

    async get(id) {
        await this.init();
        for (const task of this.cache.data) {
            if (task.id === id) return this.formatTask(task);
        }
        return {};
    }
}

module.exports = TasksAPI
