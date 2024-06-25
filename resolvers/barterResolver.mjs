export default {
    Query: {
        barters(obj, args, context, info) {
            return context.util.paginate(context.data.barter.getList(context, info), args);
        }
    },
    Barter: {
        taskUnlock(data, args, context, info) {
            if (!data || !data.taskUnlock) return null;
            return context.data.task.get(context, info, data.taskUnlock);
        },
        trader(data, args, context, info) {
            return context.data.trader.get(context, info, data.trader_id);
        }
    }
};
