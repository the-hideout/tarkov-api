const zlib = require('zlib');

class WorkerKV {
    constructor(kvName, dataSource) {
        this.cache = false;
        this.loading = false;
        this.kvName = kvName;
        this.loadingPromises = [];
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
            //console.log(`${this.kvName} is stale; refreshing`);
            this.cache = false;
        }
        if (this.loading) {
            return new Promise((resolve) => {
                this.loadingPromises.push(resolve);
            });
        }
        this.loading = true;
        this.loadingInterval = setInterval(() => {
            if (this.loading) return;
            let resolve = false;
            while (resolve = this.loadingPromises.shift()) {
                resolve();
            }
            clearInterval(this.loadingInterval);
        }, 5);
        return new Promise((resolve, reject) => {
            const startLoad = new Date();
            DATA_CACHE.getWithMetadata(this.kvName, 'text').then(response => {
                const data = response.value;
                console.log(`${requestId} ${this.kvName} load: ${new Date() - startLoad} ms`);
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
                this.dataUpdated = new Date().valueOf();
                if (this.cache.updated) {
                    this.dataUpdated = new Date(this.cache.updated).valueOf();
                }
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
