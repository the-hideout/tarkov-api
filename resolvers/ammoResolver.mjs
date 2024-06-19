export default {
    Query: {
        ammo(obj, args, context, info) {
            return context.util.paginate(context.data.item.getAmmoList(context, info), args);
        }
    },
    Ammo: {
        item(data, args, context, info) {
            return context.data.item.getItem(context, info, data.id);
        }
    }
};
