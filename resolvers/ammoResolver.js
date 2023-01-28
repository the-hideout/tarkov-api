module.exports = {
    Query: {
        ammo(obj, args, context, info) {
            return context.util.paginate(context.data.item.getAmmoList(context.requestId), args);
        }
    },
    Ammo: {
        item(data, args, context) {
            return context.data.item.getItem(context.requestId, data.id);
        }
    }
};
