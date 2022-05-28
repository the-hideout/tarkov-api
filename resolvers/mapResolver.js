module.exports = {
    Query: {
        maps(obj, args, context, info) {
            return context.data.map.getList();
        }
    },
    Map: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        },
        enemies(data, args, context, info) {
            return context.util.getLocale(data, 'enemies', info);
        }
    }
};
