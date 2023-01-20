const { request } = require('http');
const zlib = require('zlib');

class WorkerKV {
    constructor(kvName, dataSource) {
        this.cache = false;
        this.loading = false;
        this.kvName = kvName;
        this.loadingPromises = {};
        this.loadingInterval = false;
        this.dataUpdated = new Date(0);
        this.refreshInterval = 1000 * 60 * 5;
        this.dataSource = dataSource;
    }

    async init(requestId) {
        if (this.cache && new Date() - this.dataUpdated < this.refreshInterval + 60000) {
            //console.log(`${this.kvName} is fresh; not refreshing`);
            return;
        }
        if (this.dataSource.kvLoadedForRequest(this.kvName, requestId)) {
            //console.log(`${this.kvName} already loaded for request ${requestId}; not refreshing`);
            return
        }
        if (this.cache) {
            console.log(`${this.kvName} is stale; refreshing`);
            this.cache = false;
        }
        if (this.loading) {
            if (this.loadingPromises[requestId]) {
                return this.loadingPromises[requestId];
            }
            console.log(`${this.kvName} already loading; awaiting load`);
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
                        return resolve(this.init(requestId));
                    }
                    if (this.loading === false) {
                        clearTimeout(loadingTimeout);
                        clearInterval(loadingInterval);
                        console.log(`${this.kvName} load: ${new Date() - startLoad} ms (secondary)`);
                        resolve();
                    }
                }, 5);
            });
            return this.loadingPromises[requestId];
        }
        //console.log(`${this.kvName} loading`);
        this.loading = true;
        /*this.loadingInterval = setInterval(() => {
            if (this.loading) return;
            for (const reqId of Object.keys(this.loadingPromises)) {
                this.loadingPromies[reqId]();
                delete this.loadingPromies[reqId];
            }
            clearInterval(this.loadingInterval);
        }, 5);*/
        return new Promise((resolve, reject) => {
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
                let newDataUpdated = new Date().valueOf();
                if (this.cache.updated) {
                    newDataUpdated = new Date(this.cache.updated).valueOf();
                }
                if (this.dataUpdated === newDataUpdated) {
                    console.log(`${this.kvName} is still stale after re-load`);
                }
                this.dataUpdated = newDataUpdated;
                this.dataSource.setKvLoadedForRequest(this.kvName, requestId);
                this.loading = false;
                resolve();
            }).catch(error => {
                this.loading = false;
                reject(error);
            });
        });
    }
}

module.exports = WorkerKV;
