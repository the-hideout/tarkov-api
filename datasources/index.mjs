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

const schemaRefreshInterval = 1000 * 60 * 10;
let emitter;
if (typeof process !== 'undefined') {
    emitter = new (await import('node:events')).EventEmitter()
    process.on('message', (message) => {
        if (!message.id) {
            return;
        }
        if (message.action !== 'kvData') {
            return;
        }
        emitter.emit(message.id, message);
    });
}

class DataSource {
    constructor(env) {
        this.env = env;

        this.initialized = false;
        this.loading = false;
        this.requests = {};
        this.kvLoaded = [];
        this.lastSchemaRefresh = 0;

        this.worker = {
            barter: new BartersAPI(this),
            craft: new CraftsAPI(this),
            hideout: new HideoutAPI(this),
            historicalPrice: new HistoricalPricesAPI(this),
            archivedPrice: new ArchivedPricesAPI(this),
            item: new ItemsAPI(this),
            map: new MapAPI(this),
            schema: new SchemaAPI(this),
            status: new StatusAPI(this),
            task: new TasksAPI(this),
            trader: new TradersAPI(this),
            traderInventory: new TraderInventoryAPI(this),
        };
    }

    async getSchema(context) {
        if (schema && new Date() - this.lastSchemaRefresh < schemaRefreshInterval) {
            return schema;
        }
        if (loadingSchema) {
            return new Promise((resolve) => {
                let loadingTimedOut = false;
                const loadingTimeout = setTimeout(() => {
                    loadingTimedOut = true;
                }, 3100);
                loadingTimeout.unref();
                const loadingInterval = setInterval(() => {
                    if (loadingSchema === false) {
                        clearTimeout(loadingTimeout);
                        clearInterval(loadingInterval);
                        return resolve(schema);
                    }
                    if (loadingTimedOut) {
                        console.log(`Schema loading timed out; forcing load`);
                        clearInterval(loadingInterval);
                        loadingSchema = false;
                        return resolve(getSchema(this, context));
                    }
                }, 100);
                loadingInterval.unref();
            });
        }
        loadingSchema = true;
        return dynamicTypeDefs(this, context).catch(error => {
            loadingSchema = false;
            console.error('Error loading dynamic type definitions', error);
            return Promise.reject(error);
        }).then(dynamicDefs => {
            let mergedDefs;
            try {
                mergedDefs = mergeTypeDefs([typeDefs, dynamicDefs]);
            } catch (error) {
                console.error('Error merging type defs', error);
                return Promise.reject(error);
            }
            try {
                schema = makeExecutableSchema({ typeDefs: mergedDefs, resolvers: resolvers });
                loadingSchema = false;
                //console.log('schema loaded');
                this.lastSchemaRefresh = new Date().getTime();
                return schema;
            } catch (error) {
                console.error('Error making schema executable');
                if (!error.message) {
                    console.error('Check type names in resolvers');
                } else {
                    console.error(error.message);
                }
                return Promise.reject(error);
            }
        });
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
        for (const worker of Object.values(this.worker)) {
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
