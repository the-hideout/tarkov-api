module.exports = {
    Query: {
        traders(obj, args, context, info) {
            return context.util.paginate(context.data.trader.getList(context.requestId), args);
        },
        traderResetTimes: (obj, args, context) => {
            return context.data.trader.getTraderResets(context.requestId);
        },
    },
    Trader: {
        name(data, args, context, info) {
            return context.data.trader.getLocale(data.name, context, info);
        },
        description(data, args, context, info) {
            return context.data.trader.getLocale(data.description, context, info);
        },
        currency(trader, args, context) {
            return context.data.item.getItem(context.requestId, context.data.trader.getCurrencyMap()[trader.currency]);
        },
        barters(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.barter.getBartersForTrader(context.requestId, data.id);
        },
        cashOffers(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.traderInventory.getPricesForTrader(context.requestId, data.id);
        }
    },
    TraderLevel: {
        barters(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.barter.getBartersForTraderLevel(context.requestId, data.id.substring(0, data.id.indexOf('-')), data.level);
        },
        cashOffers(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.traderInventory.getPricesForTraderLevel(context.requestId, data.id.substring(0, data.id.indexOf('-')), data.level);
        }
    },
    TraderCashOffer: {
        item(data, args, context) {
            return context.data.item.getItem(context.requestId, data.id);
        },
        minTraderLevel(data) {
            return data.vendor.traderLevel;
        },
        currencyItem(data, args, context) {
            return context.data.item.getItem(context.requestId, data.currencyItem);
        },
        taskUnlock(data, args, context) {
            if (data.vendor.taskUnlock) return context.data.task.get(context.requestId, data.vendor.taskUnlock);
            return null;
        }
    },
    TraderOffer: {
        async name(data, args, context, info) {
            const trader = await context.data.trader.get(context.requestId, data.trader_id);
            return context.data.trader.getLocale(trader.name, context, info);
        },
        async normalizedName(data, args, context) {
            return (await context.data.trader.get(context.requestId, data.trader_id)).normalizedName;
        },
        trader(data, args, context) {
            return context.data.trader.get(context.requestId, data.trader_id);
        },
        taskUnlock(data, args, context) {
            if (data.taskUnlock) return context.data.task.get(context.requestId, data.taskUnlock);
            return null;
        },
    },
    TraderPrice: {
        trader(data, args, context) {
            return context.data.trader.get(context.requestId, data.trader);
        }
    },
    RequirementTrader: {
        trader(data, args, context) {
            return context.data.trader.get(context.requestId, data.trader_id);
        }
    },
    TraderStanding: {
        trader(data, args, context) {
            return context.data.trader.get(context.requestId, data.trader_id);
        }
    }
};
