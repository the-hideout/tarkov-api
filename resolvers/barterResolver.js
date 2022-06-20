module.exports = {
    Query: {
        barters(obj, args, context, info) {
            return context.data.barter.getList();
        }
    },
    Barter: {
        taskUnlock(data, args, context) {
            if (!data || !data.taskUnlock) return null;
            return context.data.quest.get(data.taskUnlock);
        },
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
        }
    }
};
