const ItemsAPI = require('./datasources/items');
const itemsAPI = new ItemsAPI();
const BartersAPI = require('./datasources/barters');
const bartersAPI = new BartersAPI();
const CraftsAPI = require('./datasources/crafts');
const craftsAPI = new CraftsAPI();

module.exports = {
    item: async (args) => {
        return await itemsAPI.getItem(args.id);
    },

    barters: async () => {
        return await bartersAPI.getList();
    },

    crafts: async () => {
        return await craftsAPI.getList();
    },
};
