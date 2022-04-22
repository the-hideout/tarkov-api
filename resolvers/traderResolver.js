module.exports = {
    Query: {
        traders(obj, args, context, info) {
            return context.data.trader.getList();
        },
        traderResetTimes: (obj, args, context) => {
            return context.data.trader.getTraderResets();
        },
    },
    Trader: {
        currency(trader, args, context) {
            return context.data.item.getItem(context.data.trader.getCurrencyMap()[trader.currency]);
        }
    },
    TraderOffer: {
        async name(data, args, context) {
            return (await context.data.trader.get(data.trader_id)).name;
        },
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
        },
        traderLevel(data, args, context) {
            return context.data.trader.getByLevel(data.trader_id, data.traderLevel)
        },
        taskUnlock(data, args, context) {
            if (data.taskUnlock) return context.data.task.get(data.taskUnlock);
            return null;
        },
    },
    TraderPrice: {
        trader(data, args, context) {
            /*if (data.trader_name) {
                return context.data.trader.getByName(data.trader_name);
            }
            return data.trader;*/
            return context.data.trader.get(data.trader);
        }
    },
    RequirementTrader: {
        traderLevel(data, args, context) {
            return context.data.trader.getByLevel(data.trader_id, data.traderLevel)
        }
    }
};
