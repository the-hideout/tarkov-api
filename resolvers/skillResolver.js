module.exports = {
    RequirementSkill: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        }
    },
    SkillLevel: {
        name(data, args, context, info) {
            return context.util.getLocale(data, 'name', info);
        }
    }
};
