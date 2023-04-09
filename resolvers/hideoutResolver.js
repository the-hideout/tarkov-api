module.exports = {
    Query: {
        hideoutModules(obj, args, context, info) {
            return context.data.hideout.getLegacyList(context.requestId);
        },
        hideoutStations(obj, args, context, info) {
            return context.util.paginate(context.data.hideout.getList(context.requestId), args);
        },
    },
    HideoutStation: {
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.craft.getCraftsForStation(context.requestId, data.id);
        },
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        }
    },
    HideoutStationBonus: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        },
        skillName(data, args, context, info) {
            return context.util.getLocale(data, 'skillName', info);
        },
        slotItems(data, args, context, info) {
            if (!data.slotItems || data.slotItems.length === 0) {
                return [];
            }
            return context.data.item.getItemsByIDs(context.requestId, data.slotItems);
        }
    },
    HideoutStationLevel: {
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.craft.getCraftsForStationLevel(context.requestId, data.id.substring(0, data.id.indexOf('-')), data.level);
        },
        description(data, args, context, info) {
            return context.util.getLocale(data, 'description', info);
        }
    },
    RequirementHideoutStationLevel: {
        station(data, args, context) {
            return context.data.hideout.getStation(context.requestId, data.station);
        }
    },
    HideoutModule: {
        moduleRequirements(data, args, context) {
            return data.moduleRequirements.map(req => {
                return context.data.hideout.getLegacyModule(context.requestId, req.name, req.quantity);
            });
        }
    }
};
