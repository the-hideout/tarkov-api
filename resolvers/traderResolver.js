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
        },
        barters(data, args, context, info) {
            if (context.data.getDepth(info) > 1) return Promise.reject(new Error('Trader.barters is unavailable at a query depth greater than 1.'));
            return context.data.barter.getBartersForTrader(data.id);
        },
        cashOffers(data, args, context, info) {
            if (context.data.getDepth(info) > 1) return Promise.reject(new Error('Trader.cashOffers is unavailable at a query depth greater than 1.'));
            return context.data.traderInventory.getPricesForTrader(data.id);
        }
    },
    TraderLevel: {
        barters(data, args, context, info) {
            if (context.data.getDepth(info) > 1) return Promise.reject(new Error('TraderLevel.barters is unavailable at a query depth greater than 1.'));
            return context.data.barter.getBartersForTraderLevel(data.id.substring(0, data.id.indexOf('-')), data.level);
        },
        cashOffers(data, args, context, info) {
            if (context.data.getDepth(info) > 1) return Promise.reject(new Error('TraderLevel.cashOffers is unavailable at a query depth greater than 1.'));
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
        async name(data, args, context) {
            return (await context.data.trader.get(data.trader_id)).name;
        },
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
        },/*
        traderLevel(data, args, context) {
            return context.data.trader.getByLevel(data.trader_id, data.traderLevel)
        },*/
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
