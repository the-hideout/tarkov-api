module.exports = {
    Query: {
        async tasks(obj, args, context, info) {
            const tasks = await context.data.task.getList();
            if (args.faction) {
                const filterFaction = args.faction.toLowerCase();
                return tasks.filter(task => {
                    if (!task.factionName) return true;
                    const taskFaction = task.factionName.toLowerCase();
                    return taskFaction === 'any' || taskFaction === filterFaction;
                });
            }
            return context.util.paginate(tasks, args);
        },
        task(obj, args, context) {
            return context.data.task.get(args.id);
        },
        quests(obj, args, context, info) {
            return context.data.task.getQuests();
        },
        questItems(obj, args, context) {
            return context.data.task.getQuestItems();
        }
    },
    Task: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        },
        trader(data, args, context) {
            return context.data.trader.get(data.trader);
        },
        map(data, args, context) {
            if (data.location_id) return context.data.map.get(data.location_id);
            return null;
        }
    },
    TaskKey: {
        keys(data, args, context) {
            return data.key_ids.map(id => {
                return context.data.item.getItem(id);
            });
        },
        map(data, args, context) {
            return context.data.map.get(data.map_id);
        }
    },
    TaskObjective: {
        __resolveType(data, args, context) {
            //return data.gql_type;
            if (data.type === 'findQuestItem' || data.type === 'giveQuestItem' || data.type === 'plantQuestItem') {
                return 'TaskObjectiveQuestItem';
            } else if (data.type === 'findItem' || data.type === 'giveItem' || data.type === 'plantItem') {
                return 'TaskObjectiveItem';
            } else if (data.type === 'mark') {
                return 'TaskObjectiveMark';
            } else if (data.type === 'extract') {
                return 'TaskObjectiveExtract';
            } else if (data.type === 'skill') {
                return 'TaskObjectiveSkill';
            } else if (data.type === 'traderLevel') {
                return 'TaskObjectiveTraderLevel';
            } else if (data.type === 'taskStatus') {
                return 'TaskObjectiveTaskStatus';
            } else if (data.type === 'playerLevel') {
                return 'TaskObjectivePlayerLevel';
            } else if (data.type === 'experience') {
                return 'TaskObjectiveExperience';
            } else if (data.type === 'shoot') {
                return 'TaskObjectiveShoot';
            } else if (data.type === 'buildWeapon') {
                return 'TaskObjectiveBuildItem';
            }
            return 'TaskObjectiveBasic';
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        }
    },
    TaskObjectiveBasic: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectiveBuildItem: {
        item(data, args, context) {
            return context.data.item.getItem(data.item);
        },
        containsAll(data, args, context) {
            return data.containsAll.map((item) => {
                return context.data.item.getItem(item.id);
            });
        },
        containsOne(data, args, context) {
            return data.containsOne.map((item) => {
                return context.data.item.getItem(item.id);
            });
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectiveExperience: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectiveExtract: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        },
        exitName(data, args, context, info) {
            return context.util.getLocale(data, 'exitName', info);
        }
    },
    TaskObjectiveItem: {
        item(data, args, context) {
            return context.data.item.getItem(data.item);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectiveMark: {
        markerItem(data, args, context) {
            return context.data.item.getItem(data.item_id);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectivePlayerLevel: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectiveQuestItem: {
        async questItem(data, args, context) {
            return context.data.task.getQuestItem(data.item_id);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectiveSkill: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectiveShoot: {
        target(data, args, context, info) {
            return context.util.getLocale(data, 'target', info);
        },
        usingWeapon(data, args, context) {
            return data.usingWeapon.map(item => {
                return context.data.item.getItem(item.id);
            });
        },
        usingWeaponMods(data, args, context) {
            return data.usingWeaponMods.map(itemGroup => {
                return itemGroup.map(item => {
                    return context.data.item.getItem(item.id);
                });
            });
        },
        wearing(data, args, context) {
            return data.wearing.map(itemGroup => {
                return itemGroup.map(item => {
                    return context.data.item.getItem(item.id);
                });
            });
        },
        notWearing(data, args, context) {
            return data.notWearing.map((item) => {
                return context.data.item.getItem(item.id);
            });
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectiveTaskStatus: {
        task(data, args, context) {
            return context.data.task.get(data.task);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    TaskObjectiveTraderLevel: {
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    QuestItem: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        },
        shortName(data, args, context, info) {
            return context.util.getLocale(data, 'shortName', info);
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        },
    },
    TaskRewards: {
        traderUnlock(data, args, context) {
            return Promise.all(data.traderUnlock.map(unlock => {
                return context.data.trader.get(unlock.trader_id);
            }));
        },
        async craftUnlock(data, args, context) {
            const crafts = await context.data.craft.getList();
            return data.craftUnlock.map(unlock => {
                return crafts.find(c => {
                    if (c.station.id !== unlock.station_id || c.level !== unlock.level) {
                        return false;
                    }
                    if (c.rewardItems[0].item !== unlock.items[0].id) {
                        return false;
                    }
                    return true;
                });
            }).filter(Boolean);
        }
    },
    TaskStatusRequirement: {
        task(data, args, context) {
            return context.data.task.get(data.task);
        }
    },
    OfferUnlock: {
        item(data, args, context) {
            if (data.contains && Array.isArray(data.contains) && data.contains.length > 0) return context.data.item.getItem(data.item, data.contains);
            return context.data.item.getItem(data.item);
        },
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id)
        }
    },
    Quest: {
        giver(data, args, context) {
            return context.data.trader.get(context.data.trader.getDataIdMap()[data.giver]);
        },
        turnin(data, args, context) {
            return context.data.trader.get(context.data.trader.getDataIdMap()[data.turnin]);
        }
    },
    QuestObjective: {
        async targetItem(data, args, context) {
            if (!data.targetItem) return null;
            try {
                return await context.data.item.getItem(data.targetItem)
            } catch (error) {
                if (error.message.includes('No item found with id')) return null;
                return Promise.reject(error);
            }
        }
    },
    QuestRequirement: {
        prerequisiteQuests(data, args, context) {
            return data.prerequisiteQuests.map(questArray => {
                return questArray.map(questId => {
                    return context.data.task.getQuest(questId);
                });
            });
        }
    },
    QuestRewardReputation: {
        async trader(data, args, context) {
            return context.data.trader.get(context.data.trader.getDataIdMap()[data.trader]);
        }
    }
};
