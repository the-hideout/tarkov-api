const WorkerKV = require('../utils/worker-kv');

class TasksAPI extends WorkerKV {
    constructor(dataSource) {
        super('quest_data', dataSource);
        this.refreshInterval = 1000 * 60 * 10;
    }

    async getList(requestId) {
        await this.init(requestId);
        return this.cache.Task;
    }

    async get(requestId, id) {
        await this.init(requestId);
        for (const task of this.cache.Task) {
            if (task.id === id || task.tarkovDataId === id) return task;
        }
        return Promise.reject(new Error(`No task found with id ${id}`));
    }

    async getTasksRequiringItem(requestId, itemId) {
        await this.init(requestId);
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

    async getTasksProvidingItem(requestId, itemId) {
        await this.init(requestId);
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

    async getQuests(requestId) {
        await this.init(requestId);
        return this.cache.Quest;
    }

    async getQuest(requestId, id) {
        await this.init(requestId);
        const quests = await this.getQuests(requestId);
        for (const quest of quests) {
            if (quest.id === id) {
                return quest;
            }
        }
        return Promise.reject(new Error(`No quest with id ${id} found`));
    }

    async getQuestItems(requestId) {
        await this.init(requestId);
        return Object.values(this.cache.QuestItem);
    }

    async getQuestItem(requestId, id) {
        await this.init(requestId);
        return this.cache.QuestItem[id];
    }
}

module.exports = TasksAPI;
