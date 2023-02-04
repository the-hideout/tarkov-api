const zlib = require('zlib');

const graphqlUtil = require('../utils/graphql-util');

class WorkerKV {
    constructor(kvName, dataSource) {
        this.cache = false;
        this.loading = false;
        this.kvName = kvName;
        this.loadingPromises = {};
        this.loadingInterval = false;
        this.dataExpires = false;
        this.dataSource = dataSource;
    }

    async init(requestId) {
        if (this.cache && (!this.dataExpires || new Date() < this.dataExpires)) {
            //console.log(`${this.kvName} is fresh; not refreshing`);
            return;
        }
        if (this.dataSource.kvLoadedForRequest(this.kvName, requestId)) {
            //console.log(`${this.kvName} already loaded for request ${requestId}; not refreshing`);
            return
        }
        if (this.cache) {
            console.log(`${this.kvName} is stale; re-loading`);
            this.cache = false;
        } else {
            //console.log(`${this.kvName} loading`);
        }
        if (this.loading) {
            if (this.loadingPromises[requestId]) {
                return this.loadingPromises[requestId];
            }
            //console.log(`${this.kvName} already loading; awaiting load`);
            this.loadingPromises[requestId] = new Promise((resolve) => {
                const startLoad = new Date();
                let loadingTimedOut = false;
                const loadingTimeout = setTimeout(() => {
                    loadingTimedOut = true;
                }, 3000);
                const loadingInterval = setInterval(() => {
                    if (loadingTimedOut) {
                        console.log(`${this.kvName} loading timed out; forcing load`);
                        clearInterval(loadingInterval);
                        this.loading = false;
                        delete this.loadingPromises[requestId];
                        return resolve(this.init(requestId));
                    }
                    if (this.loading === false) {
                        clearTimeout(loadingTimeout);
                        clearInterval(loadingInterval);
                        console.log(`${this.kvName} load: ${new Date() - startLoad} ms (secondary)`);
                        delete this.loadingPromises[requestId];
                        this.dataSource.setKvUsedForRequest(this.kvName, requestId);
                        resolve();
                    }
                }, 5);
            });
            return this.loadingPromises[requestId];
        }
        this.loading = true;
        this.loadingPromises[requestId] = new Promise((resolve, reject) => {
            const startLoad = new Date();
            DATA_CACHE.getWithMetadata(this.kvName, 'text').then(response => {
                const data = response.value;
                console.log(`${this.kvName} load: ${new Date() - startLoad} ms`);
                const metadata = response.metadata;
                if (metadata && metadata.compression) {
                    if (metadata.compression = 'gzip') {
                        this.cache = JSON.parse(zlib.gunzipSync(Buffer.from(data, metadata.encoding)).toString());
                    } else {
                        return reject(new Error(`${metadata.compression} is not a recognized compression type`));
                    }
                } else {
                    this.cache = JSON.parse(data);
                }
                let newDataExpires = false;
                if (this.cache.expiration) {
                    newDataExpires = new Date(this.cache.expiration).valueOf();
                }
                if (newDataExpires && this.dataExpires === newDataExpires) {
                    console.log(`${this.kvName} is still stale after re-load`);
                }
                this.dataExpires = newDataExpires;
                this.dataSource.setKvLoadedForRequest(this.kvName, requestId);
                this.loading = false;
                delete this.loadingPromises[requestId];
                resolve();
            }).catch(error => {
                this.loading = false;
                reject(error);
            });
        });
        return this.loadingPromises[requestId];
    }

    async getLocale(requestId, data, info) {
        await this.init(requestId);
        console.log(JSON.stringify(info, null ,4))
        const fieldName = typeof info === 'string' ? info : info.fieldName;
        const lang = graphqlUtil.getLang(info);
        if (!this.cache.locale) {
            return data.locale[fieldName];
        }
        if (!data.locale || !data.locale[fieldName]) {
            return undefined;
        }
        if (Array.isArray(data.locale[fieldName])) {
            return data.locale[fieldName].map(key => {
                if (this.cache.locale[key]) {
                    if (this.cache.locale[key][lang]) {
                        return this.cache.locale[key][lang];
                    }
                    return this.cache.locale[key].en;
                }
                return key;
            });
        }
        const key = data.locale[fieldName];
        if (this.cache.locale[key]) {
            if (this.cache.locale[key][lang]) {
                return this.cache.locale[key][lang];
            }
            return this.cache.locale[key].en;
        }
        return key;
    }
}

module.exports = WorkerKV;
