export default {
    Query: {
        crafts(obj, args, context, info) {
            return context.util.paginate(context.data.worker.craft.getList(context, info), args);
        }
    },
    Craft: {
        requiredQuestItems(data, args, context, info) {
            return Promise.all(data.requiredQuestItems.map(qi => {
                if (qi === null) {
                    return qi;
                }
                return context.data.worker.task.getQuestItem(context, info, qi.item);
            }));
        },
        station(data, args, context, info) {
            return context.data.worker.hideout.getStation(context, info, data.station);
        },
        taskUnlock(data, args, context, info) {
            if (!data || !data.taskUnlock) return null;
            return context.data.worker.task.get(context, info, data.taskUnlock);
        },
    }
};
