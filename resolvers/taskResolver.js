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
            return tasks;
        },
        task(obj, args, context) {
            return context.data.task.get(args.id);
        },
        quests(obj, args, context, info) {
            return context.data.quest.getList();
        }
    },
    Task: {
        trader(data, args, context) {
            return context.data.trader.get(data.trader);
        },
        map(data, args, context) {
            return context.data.map.get(data.location_id);
        }
    },
    TaskObjective: {
        __resolveType(data, args, context) {
            return data.gql_type;
        },
        maps(data, args, context) {
            console.log(`getting maps for objective ${data.id}`);
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
        }
    },
    TaskObjectiveExperience: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        }
    },
    TaskObjectiveExtract: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
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
        }
    },
    TaskObjectiveMark: {
        markerItem(data, args, context) {
            return context.data.item.getItem(data.markerItem);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        }
    },
    TaskObjectivePlayerLevel: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        }
    },
    TaskObjectiveQuestItem: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        }
    },
    TaskObjectiveSkill: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
        }
    },
    TaskObjectiveShoot: {
        usingWeapon(data, args, context) {
            return data.usingWeapon.map(item => {
                return context.data.item.getItem(item.id);
            });
        },
        usingWeaponMods(data, args, context) {
            return data.usingWeaponMods.map(itemGroup => {
                return {
                    items: itemGroup.map(item => {
                        return context.data.item.getItem(item.id);
                    })
                };
            });
        },
        wearing(data, args, context) {
            return data.wearing.map(itemGroup => {
                return {
                    items: itemGroup.map(item => {
                        return context.data.item.getItem(item.id);
                    })
                };
            });
        },
        notWearing(data, args, context) {
            return data.notWearing.map((id) => {
                return context.data.item.getItem(id);
            });
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(id);
            });
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
        }
    },
    TaskRewards: {
        traderUnlock(data, args, context) {
            return Promise.all(data.traderUnlock.map(unlock => {
                return context.data.trader.get(unlock.trader_id);
            }));
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
        targetItem(data, args, context) {
            if (!data.targetItem) return null;
            return context.data.item.getItem(data.targetItem)
        }
    },
    QuestRewardReputation: {
        async trader(data, args, context) {
            return context.data.trader.getByName(data.trader);
        }
    }
};
