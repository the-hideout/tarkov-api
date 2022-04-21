module.exports = {
    Query: {
        hideoutModules(obj, args, context, info) {
            return context.data.hideoutLegacy.getList();
        },
        hideoutStations(obj, args, context, info) {
            return context.data.hideout.getList();
        },
    },
    RequirementHideoutStationLevel: {
        stationLevel(data, args, context) {
            return context.data.hideout.getModuleByLevel(data.station_id, data.stationLevel);
        }
    }
};
