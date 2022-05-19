module.exports = {
    Query: {
        crafts(obj, args, context, info) {
            return context.data.craft.getList();
        }
    },
    Craft: {
        station(data, args, context) {
            return context.data.hideout.getStation(data.station);
        }
    }
};
