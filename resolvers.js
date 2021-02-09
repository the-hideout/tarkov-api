const ItemsAPI = require('./datasources/items');
const itemsAPI = new ItemsAPI();

module.exports = {
    item: async (args) => {
        return await itemsAPI.getItem(args.id);
    },
};
