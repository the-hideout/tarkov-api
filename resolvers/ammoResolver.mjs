export default {
    Query: {
        ammo(obj, args, context, info) {
            return context.util.paginate(context.data.worker.item.getAmmoList(context, info), args);
        }
    },
    Ammo: {
        item(data, args, context, info) {
            return context.data.worker.item.getItem(context, info, data.id);
        }
    }
};
