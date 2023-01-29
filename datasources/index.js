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
    constructor() {
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
        this.requests = {};
        this.kvLoaded = [];

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
                return new Promise((resolve) => {
                    const isDone = () => {
                        if (this.loading === false) {
                            resolve();
                        } else {
                            try {
                                setTimeout(isDone, 5);
                            } catch (error) {
                                console.error(error.stack);
                                resolve();
                            }
                        }
                    }
                    isDone();
                });
            }
            this.loading = true;
            return Promise.all([
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
        } catch (error) {
            console.error('error initializing data api', error.stack);
        }
    }

    kvLoadedForRequest(kvName, requestId) {
        if (!requestId) {
            return false;
        }
        if (!this.requests[requestId]) {
            this.requests[requestId] = {};
        }
        if (!this.requests[requestId].kvLoaded) {
            this.requests[requestId].kvLoaded = [];
        }
        return this.requests[requestId].kvLoaded.includes(kvName);
    }

    setKvUsedForRequest(kvName, requestId) {
        if (!this.requests[requestId]) {
            this.requests[requestId] = {};
        }
        if (!this.requests[requestId].kvUsed) {
            this.requests[requestId].kvUsed = [];
        }
        this.requests[requestId].kvUsed.push(kvName);
    }

    setKvLoadedForRequest(kvName, requestId) {
        if (!this.kvLoaded.includes(kvName)) {
            this.kvLoaded.push(kvName);
        }
        if (!this.requests[requestId]) {
            this.requests[requestId] = {};
        }
        if (!this.requests[requestId].kvLoaded) {
            this.requests[requestId].kvLoaded = [];
        }
        this.requests[requestId].kvLoaded.push(kvName);
        this.setKvUsedForRequest(kvName, requestId);
    }

    getRequestTtl(requestId) {
        if (!this.requests[requestId] || !this.requests[requestId].kvUsed) {
            return 0;
        }
        let lowestExpire = Number.MAX_SAFE_INTEGER;
        let schemaExpire = Number.MAX_SAFE_INTEGER;
        for (const worker of Object.values(this.kvWorkers)) {
            if (!this.requests[requestId].kvUsed.includes(worker.kvName)) {
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
            return 0;
        }
        return Math.round((lowestExpire - new Date().valueOf()) / 1000);
    }
}

module.exports = DataSource;
