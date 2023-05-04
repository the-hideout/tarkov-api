const WorkerKV = require('../utils/worker-kv');

class TasksAPI extends WorkerKV {
    constructor(dataSource) {
        super('quest_data', dataSource);
    }

    async getList() {
        await this.init();
        return this.cache.Task;
    }

    async get(id) {
        await this.init();
        for (const task of this.cache.Task) {
            if (task.id === id || task.tarkovDataId === id) return task;
        }
        return Promise.reject(new Error(`No task found with id ${id}`));
    }

    async getTasksRequiringItem(itemId) {
        await this.init();
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

    async getTasksProvidingItem(itemId) {
        await this.init();
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

    async getQuests() {
        await this.init();
        return this.cache.Quest;
    }

    async getQuest(id) {
        await this.init();
        const quests = await this.getQuests();
        for (const quest of quests) {
            if (quest.id === id) {
                return quest;
            }
        }
        return Promise.reject(new Error(`No quest with id ${id} found`));
    }

    async getQuestItems() {
        await this.init();
        return Object.values(this.cache.QuestItem);
    }

    async getQuestItem(id) {
        await this.init();
        return this.cache.QuestItem[id];
    }
}

module.exports = TasksAPI;
