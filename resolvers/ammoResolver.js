module.exports = {
    Query: {
        ammo(obj, args, context, info) {
            return context.data.ammo.getList();
        }
    },
    Ammo: {
        item(data, args, context) {
            return context.data.item.getItem(data.item);
        }
    }
};
