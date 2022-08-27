module.exports = {
    Query: {
        crafts(obj, args, context, info) {
            return context.util.paginate(context.data.craft.getList(), args);
        }
    },
    Craft: {
        station(data, args, context) {
            return context.data.hideout.getStation(data.station);
        }
    }
};
