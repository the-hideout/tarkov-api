const ItemsAPI = require('./datasources/items');
const itemsAPI = new ItemsAPI();

const BartersAPI = require('./datasources/barters');
const bartersAPI = new BartersAPI();

const CraftsAPI = require('./datasources/crafts');
const craftsAPI = new CraftsAPI();

const QuestsAPI = require('./datasources/quests');
const questsAPI = new QuestsAPI();

const TradersAPI = require('./datasources/traders');
const tradersAPI = new TradersAPI();

module.exports = {
    itemInit: async () => {
        return await itemsAPI.init();
    },

    item: async (args) => {
        return await itemsAPI.getItem(args.id);
    },

    itemsByType: async(args) => {
        return await itemsAPI.getItemsByType(args.type);
    },

    barters: async () => {
        return await bartersAPI.getList();
    },

    crafts: async () => {
        return await craftsAPI.getList();
    },

    quests: async () => {
        return await questsAPI.getList()
    },

    traders: async (args) => {
        return await tradersApi.get(args.id);
    },
};
