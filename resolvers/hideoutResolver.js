module.exports = {
    Query: {
        hideoutModules(obj, args, context, info) {
            return context.data.hideoutLegacy.getList();
        },
        hideoutStations(obj, args, context, info) {
            return context.data.hideout.getList();
        },
    },
    HideoutStation: {
        crafts(data, args, context) {
            return context.data.craft.getCraftsForStation(data.id);
        }
    },
    HideoutStationLevel: {
        crafts(data, args, context) {
            return context.data.craft.getCraftsForStationLevel(data.id.substring(0, data.id.indexOf('-')), data.level);
        }
    },
    RequirementHideoutStationLevel: {
        stationLevel(data, args, context) {
            return context.data.hideout.getModuleByLevel(data.station_id, data.stationLevel);
        }
    }
};
