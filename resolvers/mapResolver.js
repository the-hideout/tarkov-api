module.exports = {
    Query: {
        maps(obj, args, context, info) {
            return context.data.map.getList();
        }
    }
};
