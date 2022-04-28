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
            return data.containsAll.map((item) => {
                return context.data.item.getItem(item.id);
            });
        },
        containsOne(data, args, context) {
            return data.containsOne.map((item) => {
                return context.data.item.getItem(item.id);
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
    TaskObjectiveTaskStatus: {
        task(data, args, context) {
            return context.data.task.get(data.task);
        }
    },
    TaskObjectiveTraderLevel: {
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
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
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
        }
    }
};
