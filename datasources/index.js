const AmmoAPI = require('./ammo');
const ammoAPI = new AmmoAPI();

const BartersAPI = require('./barters');
const bartersAPI = new BartersAPI();

const CraftsAPI = require('./crafts');
const craftsAPI = new CraftsAPI();

const HideoutLegacyAPI = require('./hideout-legacy');
const hideoutLegacyAPI = new HideoutLegacyAPI();

const HideoutAPI = require('./hideout');
const hideoutAPI = new HideoutAPI();

const HistoricalPricesAPI = require('./historical-prices');
const historicalPricesAPI = new HistoricalPricesAPI();

const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

const QuestsAPI = require('./quests');
const questsAPI = new QuestsAPI();

const status = require('./status');

const TraderInventoryAPI = require('./trader-inventory');
const traderInventoryAPI = new TraderInventoryAPI();

const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

const TasksAPI = require('./tasks');
const tasksAPI = new TasksAPI();

const MapAPI = require('./maps');
const mapAPI = new MapAPI();

module.exports = {
    init: async () => {
        try {
            await Promise.all([itemsAPI.init(), tradersAPI.init(), bartersAPI.init(), ammoAPI.init()]);
        } catch (error) {
            console.error('error initializing data api', error.stack);
        }
    },
    getDepth: (info) => {
        let depth = -1;
        let currentLevel = info.path;
        while (currentLevel.prev) {
            depth++;
            currentLevel = currentLevel.prev;
        }
        return depth;
    },
    ammo: ammoAPI,
    barter: bartersAPI,
    craft: craftsAPI,
    hideoutLegacy: hideoutLegacyAPI,
    hideout: hideoutAPI,
    historicalPrice: historicalPricesAPI,
    item: itemsAPI,
    quest: questsAPI,
    traderInventory: traderInventoryAPI,
    trader: tradersAPI,
    task: tasksAPI,
    status: status,
    map: mapAPI
}