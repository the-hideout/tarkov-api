module.exports = {
    Query: {
        crafts(obj, args, context, info) {
            return context.data.craft.getList();
        }
    },
    Craft: {
        stationLevel(data, args, context) {
            return context.data.hideout.getModuleByLevel(data.station_id, data.stationLevel);
        }
    }
};
