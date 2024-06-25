import WorkerKV from '../utils/worker-kv.mjs';

class TasksAPI extends WorkerKV {
    constructor(dataSource) {
        super('quest_data', dataSource);
        this.gameModes.push('pve');
    }

    async getList(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.Task;
    }

    async get(context, info, id) {
        const { cache } = await this.getCache(context, info);
        for (const task of cache.Task) {
            if (task.id === id || task.tarkovDataId === id) return task;
        }
        return Promise.reject(new Error(`No task found with id ${id}`));
    }

    async getTasksRequiringItem(context, info, itemId) {
        const { cache } = await this.getCache(context, info);
        const tasks = cache.Task.filter(rawTask => {
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
        return tasks;
    }

    async getTasksProvidingItem(context, info, itemId) {
        const { cache } = await this.getCache(context, info);
        const tasks = cache.Task.filter(rawTask => {
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
        return tasks;
    }

    async getQuests(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.Quest;
    }

    async getQuest(context, info, id) {
        const { cache } = await this.getCache(context, info);
        for (const quest of cache.Quest) {
            if (quest.id === id) {
                return quest;
            }
        }
        return Promise.reject(new Error(`No quest with id ${id} found`));
    }

    async getQuestItems(context, info) {
        const { cache } = await this.getCache(context, info);
        return Object.values(cache.QuestItem);
    }

    async getQuestItem(context, info, id) {
        const { cache } = await this.getCache(context, info);
        return cache.QuestItem[id];
    }

    async getAchievements(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.Achievement;
    }

    async getAchievement(context, info, id) {
        const achievements = await this.getAchievements(context, info);
        for (const achievement of achievements) {
            if (achievement.id === id) {
                return achievement;
            }
        }
        return Promise.reject(new Error(`No achievement with id ${id} found`));
    }
}

export default TasksAPI;
