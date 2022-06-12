//const AmmoAPI = require('./ammo');
const BartersAPI = require('./barters');
const CraftsAPI = require('./crafts');
//const HideoutLegacyAPI = require('./hideout-legacy');
const HideoutAPI = require('./hideout');
const HistoricalPricesAPI = require('./historical-prices');
const ItemsAPI = require('./items');
const MapAPI = require('./maps');
//const QuestsAPI = require('./quests');
const status = require('./status');
const TasksAPI = require('./tasks');
const TraderInventoryAPI = require('./trader-inventory');
const TradersAPI = require('./traders');

class DataSource {
    constructor(){
        //this.ammo = new AmmoAPI();
        this.barter = new BartersAPI();
        this.craft = new CraftsAPI();
        //this.hideoutLegacy = new HideoutLegacyAPI();
        this.hideout = new HideoutAPI();
        this.historicalPrice = new HistoricalPricesAPI();
        this.item = new ItemsAPI();
        this.map = new MapAPI();
        //this.quest = new QuestsAPI();
        this.status = status;
        this.traderInventory = new TraderInventoryAPI();
        this.trader = new TradersAPI();
        this.task = new TasksAPI();

        this.initialized = false;
        this.loading = false;
    }

    async init() {
        try {
            if (this.initialized) return;
            if (this.loading) {
                return new Promise((resolve) => {
                    const isDone = () => {
                        if (this.loading === false) {
                            resolve();
                        } else {
                            try {
                                setTimeout(isDone, 5);
                            } catch (error) {
                                console.log(error.stack);
                                resolve();
                            }
                        }
                    }
                    isDone();
                });
            }
            this.loading = true;
            return Promise.all([
                this.barter.init(), 
                this.craft.init(),
                this.hideout.init(),
                this.item.init(),
                this.map.init(),
                this.task.init(),
                this.trader.init(),
                this.traderInventory.init(),
            ]).then(() => {
                this.initialized = true;
                this.loading = false;
            }).catch(error => {
                this.loading = false;
                return Promise.reject(error);
            });
        } catch (error) {
            console.error('error initializing data api', error.stack);
        }
    }
}

module.exports = DataSource;
