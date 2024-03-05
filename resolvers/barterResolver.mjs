export default {
    Query: {
        barters(obj, args, context, info) {
            return context.util.paginate(context.data.barter.getList(context), args);
        }
    },
    Barter: {
        taskUnlock(data, args, context) {
            if (!data || !data.taskUnlock) return null;
            return context.data.task.get(context, data.taskUnlock);
        },
        trader(data, args, context) {
            return context.data.trader.get(context, data.trader_id);
        }
    }
};
