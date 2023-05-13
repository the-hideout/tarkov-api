module.exports = {
    Query: {
        hideoutModules(obj, args, context, info) {
            return context.data.hideout.getLegacyList(context);
        },
        hideoutStations(obj, args, context, info) {
            return context.util.paginate(context.data.hideout.getList(context), args);
        },
    },
    HideoutStation: {
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.craft.getCraftsForStation(context, data.id);
        },
        name(data, args, context, info) {
            return context.data.hideout.getLocale(data.name, context, info);
        }
    },
    HideoutStationBonus: {
        name(data, args, context, info) {
            return context.data.hideout.getLocale(data.name, context, info);
        },
        skillName(data, args, context, info) {
            return context.data.hideout.getLocale(data.skillName, context, info);
        },
        slotItems(data, args, context, info) {
            if (!data.slotItems || data.slotItems.length === 0) {
                return [];
            }
            return context.data.item.getItemsByIDs(context, data.slotItems);
        }
    },
    HideoutStationLevel: {
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.craft.getCraftsForStationLevel(context, data.id.substring(0, data.id.indexOf('-')), data.level);
        },
        description(data, args, context, info) {
            return context.data.hideout.getLocale(data.description, context, info);
        }
    },
    RequirementHideoutStationLevel: {
        station(data, args, context) {
            return context.data.hideout.getStation(context, data.station);
        }
    },
    RequirementSkill: {
        name(data, args, context, info) {
            return context.data.hideout.getLocale(data.name, context, info);
        }
    },
    HideoutModule: {
        moduleRequirements(data, args, context) {
            return data.moduleRequirements.map(req => {
                return context.data.hideout.getLegacyModule(context, req.name, req.quantity);
            });
        }
    }
};
