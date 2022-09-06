const zlib = require('zlib');

class WorkerKV {
    constructor(kvName) {
        this.cache = false;
        this.loading = false;
        this.kvName = kvName;
        this.loadingPromises = [];
        this.loadingInterval = false;
    }

    async init() {
        if (this.cache) {
            return;
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
            DATA_CACHE.getWithMetadata(this.kvName, 'text').then(response => {
                const data = response.value;
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
