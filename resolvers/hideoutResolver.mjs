export default {
    Query: {
        hideoutModules(obj, args, context, info) {
            context.warnings.push(`The hideoutModules query is deprecated and provided only for backwards compatibility purposes. Please use the hideoutStations query, which includes the latest hideout information.`);
            return context.data.hideout.getLegacyList(context, info);
        },
        hideoutStations(obj, args, context, info) {
            return context.util.paginate(context.data.hideout.getList(context, info), args);
        },
    },
    HideoutStation: {
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 1);
            return context.data.craft.getCraftsForStation(context, info, data.id);
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
            return context.data.item.getItemsByIDs(context, info, data.slotItems);
        }
    },
    HideoutStationLevel: {
        crafts(data, args, context, info) {
            context.util.testDepthLimit(info, 2);
            return context.data.craft.getCraftsForStationLevel(context, info, data.id.substring(0, data.id.indexOf('-')), data.level);
        },
        description(data, args, context, info) {
            return context.data.hideout.getLocale(data.description, context, info);
        }
    },
    RequirementHideoutStationLevel: {
        station(data, args, context) {
            return context.data.hideout.getStation(context, info, data.station);
        }
    },
    RequirementSkill: {
        name(data, args, context, info) {
            return context.data.hideout.getLocale(data.name, context, info);
        },
        skill(data, args, context, info) {
            return context.data.item.getSkill(context, info, data.name);
        },
    },
    HideoutModule: {
        moduleRequirements(data, args, context, info) {
            return data.moduleRequirements.map(req => {
                return context.data.hideout.getLegacyModule(context, info, req.name, req.quantity);
            });
        }
    }
};
