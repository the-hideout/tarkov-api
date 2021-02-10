const ItemsAPI = require('./datasources/items');
const itemsAPI = new ItemsAPI();
const BartersAPI = require('./datasources/barters');
const bartersAPI = new BartersAPI();

module.exports = {
    item: async (args) => {
        return await itemsAPI.getItem(args.id);
    },

    barters: async () => {
        return await bartersAPI.getList();
    },
};
