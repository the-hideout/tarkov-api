module.exports = {
    Query: {
        hideoutModules(obj, args, context, info) {
            return context.data.hideout.getLegacyList();
        },
        hideoutStations(obj, args, context, info) {
            return context.util.paginate(context.data.hideout.getList(), args);
        },
    },
    HideoutStation: {
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.craft.getCraftsForStation(data.id);
        },
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        }
    },
    HideoutStationLevel: {
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.craft.getCraftsForStationLevel(data.id.substring(0, data.id.indexOf('-')), data.level);
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    RequirementHideoutStationLevel: {
        station(data, args, context) {
            return context.data.hideout.getStation(data.station);
        }
    },
    HideoutModule: {
        moduleRequirements(data, args, context) {
            return data.moduleRequirements.map(req => {
                return context.data.hideout.getLegacyModule(req.name, req.quantity);
            });
        }
    }
};
