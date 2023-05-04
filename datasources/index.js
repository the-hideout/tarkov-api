const BartersAPI = require('./barters');
const CraftsAPI = require('./crafts');
const HideoutAPI = require('./hideout');
const HistoricalPricesAPI = require('./historical-prices');
const ItemsAPI = require('./items');
const MapAPI = require('./maps');
const SchemaAPI = require('./schema');
const status = require('./status');
const TasksAPI = require('./tasks');
const TraderInventoryAPI = require('./trader-inventory');
const TradersAPI = require('./traders');

class DataSource {
    constructor(requestId) {
        this.requestId = requestId;
        this.barter = new BartersAPI(this);
        this.craft = new CraftsAPI(this);
        this.hideout = new HideoutAPI(this);
        this.historicalPrice = new HistoricalPricesAPI(this);
        this.item = new ItemsAPI(this);
        this.map = new MapAPI(this);
        this.schema = new SchemaAPI(this);
        this.status = status;
        this.traderInventory = new TraderInventoryAPI(this);
        this.trader = new TradersAPI(this);
        this.task = new TasksAPI(this);

        this.initialized = false;
        this.loading = false;
        this.kvUsed = [];

        this.kvWorkers = {
            barter: this.barter,
            craft: this.craft,
            hideout: this.hideout,
            historicalPrice: this.historicalPrice,
            item: this.item,
            map: this.map,
            schema: this.schema,
            task: this.task,
            trader: this.trader,
            traderInventory: this.traderInventory,
        };
    }

    async init() {
        try {
            if (this.initialized) return;
            if (this.loading) {
                return this.loading;
            }
            this.loading = Promise.all([
                /*this.barter.init(),
                this.craft.init(),
                this.hideout.init(),
                this.historicalPrice.init(),
                this.item.init(),
                this.map.init(),
                this.task.init(),
                this.trader.init(),
                this.traderInventory.init(),*/
                this.schema.init(),
            ]).then(() => {
                this.initialized = true;
                this.loading = false;
            }).catch(error => {
                this.loading = false;
                return Promise.reject(error);
            });
            return this.loading;
        } catch (error) {
            console.error('error initializing data api', error.stack);
        }
    }

    kvUsed(kvName) {
        return this.kvUsed.includes(kvName);
    }

    setKvUsed(kvName) {
        if (!this.kvUsed.includes(kvName)) {
            this.kvUsed.push(kvName);
        }
    }

    getRequestTtl() {
        let lowestExpire = Number.MAX_SAFE_INTEGER;
        let schemaExpire = Number.MAX_SAFE_INTEGER;
        for (const worker of Object.values(this.kvWorkers)) {
            if (!this.kvUsed.includes(worker.kvName)) {
                continue;
            }
            if (worker.kvName === 'schema_data') {
                schemaExpire = worker.dataExpires;
                continue;
            }
            if (typeof worker.dataExpires !== 'boolean' && worker.dataExpires < lowestExpire) {
                lowestExpire = worker.dataExpires;
            }
        }
        if (!lowestExpire) {
            lowestExpire = schemaExpire;
        }
        if (lowestExpire === Number.MAX_SAFE_INTEGER) {
            lowestExpire = 0;
        }
        let ttl = Math.round((lowestExpire - new Date().valueOf()) / 1000);
        if (ttl <= 0) {
            ttl = 0;
        }
        return ttl;
    }
}

module.exports = DataSource;
