module.exports = {
    Query: {
        async tasks(obj, args, context, info) {
            let tasks = await context.data.task.getList(context);
            if (args.faction) {
                const filterFaction = args.faction.toLowerCase();
                tasks = tasks.filter(task => {
                    if (!task.factionName) return true;
                    const taskFaction = task.factionName.toLowerCase();
                    return taskFaction === 'any' || taskFaction === filterFaction;
                });
            }
            return context.util.paginate(tasks, args);
        },
        task(obj, args, context) {
            return context.data.task.get(context, args.id);
        },
        quests(obj, args, context, info) {
            return context.data.task.getQuests(context);
        },
        questItems(obj, args, context) {
            return context.data.task.getQuestItems(context);
        }
    },
    HealthEffect: {
        bodyParts(data, args, context, info) {
            if (data.bodyParts.length === 0) {
                return [];
            }
            return context.data.task.getLocale(data.bodyParts, context, info);
        },
        effects(data, args, context, info) {
            if (data.effects.length === 0) {
                return [];
            }
            return context.data.task.getLocale(data.effects, context, info);
        },
    },
    SkillLevel: {
        name(data, args, context, info) {
            return context.data.task.getLocale(data.name, context, info);
        }
    },
    Task: {
        name(data, args, context, info) {
            return context.data.task.getLocale(data.name, context, info);
        },
        trader(data, args, context) {
            return context.data.trader.get(context, data.trader);
        },
        map(data, args, context) {
            if (data.location_id) return context.data.map.get(context, data.location_id);
            return null;
        }
    },
    TaskKey: {
        keys(data, args, context) {
            return data.key_ids.map(id => {
                return context.data.item.getItem(context, id);
            });
        },
        map(data, args, context) {
            return context.data.map.get(context, data.map_id);
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
            } else if (data.type === 'traderStanding') {
                return 'TaskObjectiveTraderStanding';
            } else if (data.type === 'useItem') {
                return 'TaskObjectiveUseItem';
            }
            return 'TaskObjectiveBasic';
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        }
    },
    TaskObjectiveBasic: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveBuildItem: {
        item(data, args, context) {
            return context.data.item.getItem(context, data.item);
        },
        containsAll(data, args, context) {
            return data.containsAll.map((item) => {
                return context.data.item.getItem(context, item.id);
            });
        },
        containsCategory(data, args,context) {
            return data.containsCategory.map((cat) => {
                return context.data.item.getCategory(context, cat.id);
            });
        },
        containsOne(data, args, context) {
            return data.containsOne.map((item) => {
                return context.data.item.getItem(context, item.id);
            });
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveExperience: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveExtract: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        },
        exitName(data, args, context, info) {
            return context.data.task.getLocale(data.exitName, context, info);
        },
        exitStatus(data, args, context, info) {
            return context.data.task.getLocale(data.exitStatus, context, info);
        },
        zoneNames(data, args, context, info) {
            if (data.zoneNames.length === 0) {
                return [];
            }
            return context.data.task.getLocale(data.zoneNames, context, info);
        },
    },
    TaskObjectiveItem: {
        item(data, args, context) {
            return context.data.item.getItem(context, data.item);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveMark: {
        markerItem(data, args, context) {
            return context.data.item.getItem(context, data.item_id);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectivePlayerLevel: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveQuestItem: {
        async questItem(data, args, context) {
            return context.data.task.getQuestItem(context, data.item_id);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveSkill: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveShoot: {
        bodyParts(data, args, context, info) {
            if (!data.bodyParts || data.bodyParts.length === 0) return [];
            return context.data.task.getLocale(data.bodyParts, context, info);
        },
        target(data, args, context, info) {
            return context.data.task.getLocale(data.target, context, info);
        },
        usingWeapon(data, args, context) {
            return data.usingWeapon.map(item => {
                return context.data.item.getItem(context, item.id);
            });
        },
        usingWeaponMods(data, args, context) {
            return data.usingWeaponMods.map(itemGroup => {
                return itemGroup.map(item => {
                    return context.data.item.getItem(context, item.id);
                });
            });
        },
        wearing(data, args, context) {
            return data.wearing.map(itemGroup => {
                return itemGroup.map(item => {
                    return context.data.item.getItem(context, item.id);
                });
            });
        },
        notWearing(data, args, context) {
            return data.notWearing.map((item) => {
                return context.data.item.getItem(context, item.id);
            });
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        },
        zoneNames(data, args, context, info) {
            if (data.zoneNames.length === 0) {
                return [];
            }
            return context.data.task.getLocale(data.zoneNames, context, info);
        },
    },
    TaskObjectiveTaskStatus: {
        task(data, args, context) {
            return context.data.task.get(context, data.task);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveTraderLevel: {
        trader(data, args, context) {
            return context.data.trader.get(context, data.trader_id);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveTraderStanding: {
        trader(data, args, context) {
            return context.data.trader.get(context, data.trader_id);
        },
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        }
    },
    TaskObjectiveUseItem: {
        maps(data, args, context) {
            return data.map_ids.map(id => {
                return context.data.map.get(context, id);
            });
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        },
        useAny(data, args, context) {
            return Promise.all(data.useAny.map(id => context.data.item.getItem(context, id)));
        },
        zoneNames(data, args, context, info) {
            return context.data.task.getLocale(data.zoneNames, context, info);
        },
    },
    QuestItem: {
        name(data, args, context, info) {
            return context.data.task.getLocale(data.name, context, info);
        },
        shortName(data, args, context, info) {
            return context.data.task.getLocale(data.shortName, context, info);
        },
        description(data, args, context, info) {
            return context.data.task.getLocale(data.description, context, info);
        },
    },
    TaskRewards: {
        traderUnlock(data, args, context) {
            return Promise.all(data.traderUnlock.map(unlock => {
                return context.data.trader.get(context, unlock.trader_id);
            }));
        },
        async craftUnlock(data, args, context) {
            if (!data.craftUnlock) {
                return [];
            }
            if (data.craftUnlock.length === 0) {
                return [];
            }
            const crafts = await context.data.craft.getList(context);
            return data.craftUnlock.map(unlock => {
                return crafts.find(c => {
                    if (c.station !== unlock.station_id || c.level !== unlock.level) {
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
            return context.data.task.get(context, data.task);
        }
    },
    OfferUnlock: {
        item(data, args, context) {
            if (data.contains && Array.isArray(data.contains) && data.contains.length > 0) return context.data.item.getItem(context, data.item, data.contains);
            return context.data.item.getItem(context, data.item);
        },
        trader(data, args, context) {
            return context.data.trader.get(context, data.trader_id)
        }
    },
    Quest: {
        giver(data, args, context) {
            return context.data.trader.get(context, context.data.trader.getDataIdMap()[data.giver]);
        },
        turnin(data, args, context) {
            return context.data.trader.get(context, context.data.trader.getDataIdMap()[data.turnin]);
        }
    },
    QuestObjective: {
        async targetItem(data, args, context) {
            if (!data.targetItem) return null;
            try {
                return await context.data.item.getItem(context, data.targetItem)
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
                    return context.data.task.getQuest(context, questId);
                });
            });
        }
    },
    QuestRewardReputation: {
        async trader(data, args, context) {
            return context.data.trader.get(context, context.data.trader.getDataIdMap()[data.trader]);
        }
    }
};
