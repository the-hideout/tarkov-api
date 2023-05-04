module.exports = {
    Query: {
        barters(obj, args, context, info) {
            return context.util.paginate(context.data.barter.getList(), args);
        }
    },
    Barter: {
        taskUnlock(data, args, context) {
            if (!data || !data.taskUnlock) return null;
            return context.data.task.get(data.taskUnlock);
        },
        trader(data, args, context) {
            return context.data.trader.get(data.trader_id);
        }
    }
};
