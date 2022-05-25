class TasksAPI {
    constructor(){
        this.cache = false;
        this.taskList = false;
        this.loading = false;
    }

    async init(){
        try {
            if (this.loading) await this.loading;
            if(this.cache){
                return true;
            }
            this.loading = ITEM_DATA.get('TASK_DATA_V2', 'json');
            this.cache = await this.loading;
            this.loading = false;
        } catch (error){
            console.error(error);
        }
    }

    formatTask(rawTask) {
        return {
            ...rawTask,
            objectives: rawTask.objectives.map((obj) => {
                const objective = {
                    ...obj
                };
                if (obj.type === 'findQuestItem' || obj.type === 'giveQuestItem' || obj.type === 'plantQuestItem') {
                    objective.gql_type = 'TaskObjectiveQuestItem';
                } else if (obj.type === 'findItem' || obj.type === 'giveItem' || obj.type === 'plantItem') {
                    objective.gql_type = 'TaskObjectiveItem';
                } else if (obj.type === 'mark') {
                    objective.gql_type = 'TaskObjectiveMark';
                } else if (obj.type === 'extract') {
                    objective.gql_type = 'TaskObjectiveExtract';
                } else if (obj.type === 'skill') {
                    objective.gql_type = 'TaskObjectiveSkill';
                } else if (obj.type === 'traderLevel') {
                    objective.gql_type = 'TaskObjectiveTraderLevel';
                } else if (obj.type === 'taskStatus') {
                    objective.gql_type = 'TaskObjectiveTaskStatus';
                } else if (obj.type === 'playerLevel') {
                    objective.gql_type = 'TaskObjectivePlayerLevel';
                } else if (obj.type === 'experience') {
                    objective.gql_type = 'TaskObjectiveExperience';
                } else if (obj.type === 'shoot') {
                    objective.gql_type = 'TaskObjectiveShoot';
                } else if (obj.type === 'buildWeapon') {
                    objective.gql_type = 'TaskObjectiveBuildItem';
                    /*objective.containsAll = obj.containsAll.map((item) => {
                        return item.id;
                    });
                    objective.containsOne = obj.containsOne.map((item) => {
                        return item.id;
                    });*/
                } else {
                    objective.gql_type = 'TaskObjectiveBasic';
                }
                return objective;
            }),
            /*startRewards: this.formatRewards(rawTask.startRewards),
            finishRewards: this.formatRewards(rawTask.finishRewards)*/
        };
    }

    async formatRewards(rewards) {
        return {
            traderStanding: rewards.traderStanding,
            items: rewards.item.map((item) => {
                return {
                    ...item,
                    attributes: []
                }
            }),
            offerUnlock: rewards.offerUnlock,
            skillLevelReward: rewards.skill,
            traderUnlock: rewards.traderUnlock
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
        if (!this.cache) {
            return {};
        }
        for (const task of this.cache.data) {
            if (task.id === id) return this.formatTask(task);
        }
        return {};
    }

    async getTasksRequiringItem(itemId) {
        await this.init();
        if (!this.cache) {
            return [];
        }
        const tasks = this.cache.data.filter(rawTask => {
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
            return this.formatTask(rawTask);
        });
    }

    async getTasksProvidingItem(itemId) {
        await this.init();
        if (!this.cache) {
            return [];
        }
        const tasks = this.cache.data.filter(rawTask => {
            for (const reward of rawTask.startRewards.item) {
                if (reward.item === itemId) {
                    return true
                }
                for (const inner of reward.contains) {
                    if (inner.item === itemId) {
                        return true;
                    }
                }
            }
            for (const reward of rawTask.finishRewards.item) {
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
            return this.formatTask(rawTask);
        });
    }
}

module.exports = TasksAPI;
