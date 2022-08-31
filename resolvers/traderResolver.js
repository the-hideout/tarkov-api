module.exports = {
    Query: {
        traders(obj, args, context, info) {
            return context.util.paginate(context.data.trader.getList(), args);
        },
        traderResetTimes: (obj, args, context) => {
            return context.data.trader.getTraderResets();
        },
    },
    Trader: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        },
        currency(trader, args, context) {
            return context.data.item.getItem(context.data.trader.getCurrencyMap()[trader.currency]);
        },
        barters(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.barter.getBartersForTrader(data.id);
        },
        cashOffers(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.traderInventory.getPricesForTrader(data.id);
        }
    },
    TraderLevel: {
        barters(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.barter.getBartersForTraderLevel(data.id.substring(0, data.id.indexOf('-')), data.level);
        },
        cashOffers(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.traderInventory.getPricesForTraderLevel(data.id.substring(0, data.id.indexOf('-')), data.level);
        }
    },
    TraderCashOffer: {
        item(data, args, context) {
            return context.data.item.getItem(data.id);
        },
        minTraderLevel(data) {
            return data.vendor.traderLevel;
        },
        currencyItem(data, args, context) {
            return context.data.item.getItem(data.currencyItem);
        },
        taskUnlock(data, args, context) {
            if (data.vendor.taskUnlock) return context.data.task.get(data.vendor.taskUnlock);
            return null;
        }
    },
    TraderOffer: {
        async name(data, args, context, info) {
            return context.util.getLocale(await context.data.trader.get(data.trader_id), 'name', info);
        },
        async normalizedName(data, args, context) {
            return (await context.data.trader.get(data.trader_id)).normalizedName;
        },
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
        },
        taskUnlock(data, args, context) {
            if (data.taskUnlock) return context.data.task.get(data.taskUnlock);
            return null;
        },
    },
    TraderPrice: {
        async trader(data, args, context) {
            try {
                return await context.data.trader.get(data.trader);
            } catch (error) {
                console.log('error was thrown', error);
            }
        }
    },
    RequirementTrader: {
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
        }
    },
    TraderStanding: {
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
        }
    }
};
