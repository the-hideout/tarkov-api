import { v4 as uuidv4 } from 'uuid';

import BartersAPI from './barters.mjs';
import CraftsAPI from './crafts.mjs';
import HideoutAPI from './hideout.mjs';
import HistoricalPricesAPI from './historical-prices.mjs';
import ArchivedPricesAPI from './archived-prices.mjs';
import ItemsAPI from './items.mjs';
import MapAPI from './maps.mjs';
import SchemaAPI from './schema.mjs';
import StatusAPI from './status.mjs';
import TasksAPI from './tasks.mjs';
import TraderInventoryAPI from './trader-inventory.mjs';
import TradersAPI from './traders.mjs';

let emitter;
if (typeof process !== 'undefined') {
    emitter = new (await import('node:events')).EventEmitter()
    process.on('message', (message) => {
        if (!message.id) {
            return;
        }
        emitter.emit(message.id, message);
    });
}

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
        this.status = new StatusAPI(this);
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

    async getData(kvName) {
        if (typeof process !== 'undefined') {
            return new Promise((resolve, reject) => {
                const messageId = uuidv4();
                emitter.once(messageId, (message) => {
                    resolve(JSON.parse(message.data));
                });
                process.send({action: 'getKv', kvName, id: messageId});
            });
        }
        return this.env.DATA_CACHE.get(kvName, 'json');
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
