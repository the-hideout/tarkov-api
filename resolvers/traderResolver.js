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
    TraderPrice: {
        trader(data, args, context) {
            if (data.trader_name) {
                return context.data.trader.getByName(data.trader_name);
            }
            return data.trader;
        }
    },
    RequirementTrader: {
        traderLevel(data, args, context) {
            return context.data.trader.getByLevel(data.trader_id, data.traderLevel)
        }
    }
};
