module.exports = {
    Query: {
        barters(obj, args, context, info) {
            return context.data.barter.getList();
        }
    },
    Barter: {
        taskUnlock(data, args, context) {
            if (!data || !data.taskUnlock) return null;
            return context.data.task.get(data.taskUnlock);
        },
        traderLevel(data, args, context) {
            return context.data.trader.getByLevel(data.trader_id, data.traderLevel);
        }
    }
};
