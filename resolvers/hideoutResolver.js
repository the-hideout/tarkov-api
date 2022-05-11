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
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.craft.getCraftsForStation(data.id);
        }
    },
    HideoutStationLevel: {
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.craft.getCraftsForStationLevel(data.id.substring(0, data.id.indexOf('-')), data.level);
        }
    },
    RequirementHideoutStationLevel: {
        station(data, args, context) {
            return context.data.hideout.getStation(data.station);
        }
    }
};
