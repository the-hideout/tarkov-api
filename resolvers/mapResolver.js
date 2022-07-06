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
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        },
        enemies(data, args, context, info) {
            return context.util.getLocale(data, 'enemies', info);
        }
    },
    BossSpawn: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        }
    },
    BossEscort: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        }
    }
};
