import BartersAPI from './barters.mjs';
import CraftsAPI from './crafts.mjs';
import HideoutAPI from './hideout.mjs';
import HistoricalPricesAPI from './historical-prices.mjs';
import ArchivedPricesAPI from './archived-prices.mjs';
import ItemsAPI from './items.mjs';
import MapAPI from './maps.mjs';
import SchemaAPI from './schema.mjs';
import status from './status.mjs';
import TasksAPI from './tasks.mjs';
import TraderInventoryAPI from './trader-inventory.mjs';
import TradersAPI from './traders.mjs';

class DataSource {
    constructor(env) {
        this.env = env;
        this.barter = new BartersAPI(this);
        this.craft = new CraftsAPI(this);
        this.hideout = new HideoutAPI(this);
        this.historicalPrice = new HistoricalPricesAPI(this);
        this.archivedPrice = new ArchivedPricesAPI(this);
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
            archivedPrice: this.archivedPrice,
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
                    let loadingTimedOut = false;
                    const loadingTimeout = setTimeout(() => {
                        loadingTimedOut = true;
                    }, 3000);
                    const loadingInterval = setInterval(() => {
                        if (this.loading === false) {
                            clearTimeout(loadingTimeout);
                            clearInterval(loadingInterval);
                            return resolve();
                        }
                        if (loadingTimedOut) {
                            console.log(`DataSource init timed out; forcing init`);
                            clearInterval(loadingInterval);
                            this.loading = false;
                            return resolve(this.init());
                        }
                    }, 100);
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
        if (!this.requests[requestId].kvUsed.includes(kvName)) {
            this.requests[requestId].kvUsed.push(kvName);
        }
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
        if (!this.requests[requestId].kvLoaded.includes(kvName)) {
            this.requests[requestId].kvLoaded.push(kvName);
        }
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
            lowestExpire = 0;
        }
        let ttl = Math.round((lowestExpire - new Date().valueOf()) / 1000);
        if (ttl <= 0) {
            ttl = 0;
        }
        ttl = Math.max(ttl, 60);
        return ttl;
    }
}

export default DataSource;
