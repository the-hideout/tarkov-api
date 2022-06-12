module.exports = {
    Query: {
        ammo(obj, args, context, info) {
            return context.data.item.getAmmoList();
        }
    },
    Ammo: {
        item(data, args, context) {
            return context.data.item.getItem(data.id);
        }
    }
};
