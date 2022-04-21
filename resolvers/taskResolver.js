module.exports = {
    Query: {
        tasks(obj, args, context, info) {
            return context.data.task.getList();
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
        traderLevelRequirements(data, args, context) {
            return data.traderLevelRequirements.map(req => {
                return context.data.trader.getByLevel(req.trader_id, req.level);
            });            
        }
    },
    TaskObjective: {
        __resolveType(data, args, context) {
            return data.gql_type;
        }
    },
    TaskObjectiveBuildItem: {
        item(data, args, context) {
            return context.data.item.getItem(data.item);
        },
        containsAll(data, args, context) {
            return data.containsAll.map((id) => {
                return context.data.item.getItem(id);
            });
        },
        containsOne(data, args, context) {
            return data.containsOne.map((id) => {
                return context.data.item.getItem(id);
            });
        }
    },
    TaskObjectiveItem: {
        item(data, args, context) {
            return context.data.item.getItem(data.item);
        }
    },
    TaskObjectiveMark: {
        markerItem(data, args, context) {
            return context.data.item.getItem(data.markerItem);
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
        }
    },
    TaskObjectiveTraderLevel: {
        traderLevel(data, args, context) {
            return context.data.trader.getByLevel(data.trader_id, data.traderLevel);
        }
    },
    TaskRewards: {
        traderStanding(data, args, context) {
            return data.traderStanding.map(ts => {
                return {
                    trader: context.data.trader.get(ts.trader),
                    standing: ts.standing
                };
            });
        },
        traderUnlock(data, args, context) {
            return data.traderUnlock.map(unlock => {
                return context.data.trader.get(unlock.trader);
            });
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
        traderLevel(data, args, context) {
            return context.data.trader.getByLevel(data.trader_id, data.traderLevel)
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
        trader(data, args, context) {
            return context.data.trader.getByName(data.trader);
        }
    }
};
