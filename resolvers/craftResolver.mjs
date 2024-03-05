export default {
    Query: {
        crafts(obj, args, context, info) {
            return context.util.paginate(context.data.craft.getList(context), args);
        }
    },
    Craft: {
        requiredQuestItems(data, args, context) {
            return Promise.all(data.requiredQuestItems.map(qi => {
                if (qi === null) {
                    return qi;
                }
                return context.data.task.getQuestItem(context, qi.item);
            }));
        },
        station(data, args, context) {
            return context.data.hideout.getStation(context, data.station);
        },
        taskUnlock(data, args, context) {
            if (!data || !data.taskUnlock) return null;
            return context.data.task.get(context, data.taskUnlock);
        },
    }
};
