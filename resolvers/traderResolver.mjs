export default {
    Query: {
        traders(obj, args, context, info) {
            return context.util.paginate(context.data.worker.trader.getList(context, info), args);
        },
        traderResetTimes: (obj, args, context, info) => {
            return context.data.worker.trader.getTraderResets(context, info, info);
        },
    },
    Trader: {
        name(data, args, context, info) {
            return context.data.worker.trader.getLocale(data.name, context, info);
        },
        description(data, args, context, info) {
            return context.data.worker.trader.getLocale(data.description, context, info);
        },
        currency(trader, args, context, info) {
            return context.data.worker.item.getItem(context, info, context.data.worker.trader.getCurrencyMap()[trader.currency]);
        },
        barters(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.worker.barter.getBartersForTrader(context, info, data.id);
        },
        cashOffers(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.worker.traderInventory.getPricesForTrader(context, info, data.id);
        }
    },
    TraderLevel: {
        barters(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.barter.getBartersForTraderLevel(context, info, data.id.substring(0, data.id.indexOf('-')), data.level);
        },
        cashOffers(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.worker.traderInventory.getPricesForTraderLevel(context, info, data.id.substring(0, data.id.indexOf('-')), data.level);
        }
    },
    TraderCashOffer: {
        id(data, args, context, info) {
            return data.offer_id;
        },
        item(data, args, context, info) {
            return context.data.worker.item.getItem(context, info, data.id);
        },
        minTraderLevel(data) {
            return data.vendor.traderLevel;
        },
        currencyItem(data, args, context, info) {
            return context.data.worker.item.getItem(context, info, data.currencyItem);
        },
        taskUnlock(data, args, context, info) {
            if (!data.vendor.taskUnlock) {
                return null;
            }
            return context.data.worker.task.get(context, info, data.vendor.taskUnlock);
        },
        buyLimit(data) {
            return data.vendor.buyLimit;
        }
    },
    TraderOffer: {
        async name(data, args, context, info) {
            const trader = await context.data.worker.trader.get(context, info, data.trader_id);
            return context.data.worker.trader.getLocale(trader.name, context, info);
        },
        async normalizedName(data, args, context, info) {
            const trader = await context.data.worker.trader.get(context, info, data.trader_id);
            return trader.normalizedName;
        },
        trader(data, args, context, info) {
            return context.data.worker.trader.get(context, info, data.trader_id);
        },
        taskUnlock(data, args, context, info) {
            if (!data.taskUnlock) {
                return null;
            }
            return context.data.worker.task.get(context, info, data.taskUnlock);
        },
    },
    TraderPrice: {
        trader(data, args, context, info) {
            return context.data.worker.trader.get(context, info, data.trader);
        }
    },
    RequirementTrader: {
        trader(data, args, context, info) {
            return context.data.worker.trader.get(context, info, data.trader_id);
        }
    },
    TraderStanding: {
        trader(data, args, context, info) {
            return context.data.worker.trader.get(context, info, data.trader_id);
        }
    }
};
