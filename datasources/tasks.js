const WorkerKV = require('../utils/worker-kv');

class TasksAPI extends WorkerKV {
    constructor(dataSource) {
        super('quest_data', dataSource);
    }

    async getList(context) {
        await this.init(context);
        return this.cache.Task;
    }

    async get(context, id) {
        await this.init(context);
        for (const task of this.cache.Task) {
            if (task.id === id || task.tarkovDataId === id) return task;
        }
        return Promise.reject(new Error(`No task found with id ${id}`));
    }

    async getTasksRequiringItem(context, itemId) {
        await this.init(context);
        const tasks = this.cache.Task.filter(rawTask => {
            for (const obj of rawTask.objectives) {
                if (obj.item === itemId) {
                    return true;
                }
                if (obj.markerItem === itemId) {
                    return true;
                }
                if (obj.containsOne) {
                    for (const item of obj.containsOne) {
                        if (item.id === itemId) {
                            return true;
                        }
                    }
                }
                if (obj.containsAll) {
                    for (const item of obj.containsAll) {
                        if (item.id === itemId) {
                            return true;
                        }
                    }
                }
                if (obj.wearing) {
                    for (const outfit of obj.wearing) {
                        for (const item of outfit) {
                            if (item.id === itemId) {
                                return true;
                            }
                        }
                    }
                }
                if (obj.usingWeapon) {
                    for (const item of obj.usingWeapon) {
                        if (item.id === itemId) {
                            return true;
                        }
                    }
                }
                if (obj.usingWeaponMods) {
                    for (const group of obj.usingWeaponMods) {
                        for (const item of group) {
                            if (item.id === itemId) {
                                return true;
                            }
                        }
                    }
                }
            }
            return false;
        });
        return tasks.map(rawTask => {
            return rawTask;
        });
    }

    async getTasksProvidingItem(context, itemId) {
        await this.init(context);
        const tasks = this.cache.Task.filter(rawTask => {
            for (const reward of rawTask.startRewards.items) {
                if (reward.item === itemId) {
                    return true
                }
                for (const inner of reward.contains) {
                    if (inner.item === itemId) {
                        return true;
                    }
                }
            }
            for (const reward of rawTask.finishRewards.items) {
                if (reward.item === itemId) {
                    return true;
                }
                for (const inner of reward.contains) {
                    if (inner.item === itemId) {
                        return true;
                    }
                }
            }
            return false;
        });
        return tasks.map(rawTask => {
            return rawTask;
        });
    }

    async getQuests(context) {
        await this.init(context);
        return this.cache.Quest;
    }

    async getQuest(context, id) {
        await this.init(context);
        const quests = await this.getQuests(context);
        for (const quest of quests) {
            if (quest.id === id) {
                return quest;
            }
        }
        return Promise.reject(new Error(`No quest with id ${id} found`));
    }

    async getQuestItems(context) {
        await this.init(context);
        return Object.values(this.cache.QuestItem);
    }

    async getQuestItem(context, id) {
        await this.init(context);
        return this.cache.QuestItem[id];
    }
}

module.exports = TasksAPI;
