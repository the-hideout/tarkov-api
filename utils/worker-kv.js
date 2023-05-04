const zlib = require('zlib');

const ungzip = (input, options) => {
    return new Promise(function(resolve, reject) {
        zlib.gunzip(input, options, function (error, result) {
            if (!error) {
                resolve(String(result));
            } else {
                reject(Error(error));
            }
        });
    });
};

class WorkerKV {
    constructor(kvName, dataSource) {
        this.cache = false;
        this.loading = false;
        this.kvName = kvName;
        this.dataExpires = false;
        this.dataSource = dataSource;
    }

    async init() {
        if (this.cache) {
            return;
        }
        if (this.loading) {
            return this.loading;
        }
        this.loading = new Promise((resolve, reject) => {
            const startLoad = new Date();
            DATA_CACHE.getWithMetadata(this.kvName, 'text').then(async response => {
                console.log(`${this.kvName} load: ${new Date() - startLoad} ms`);
                const metadata = response.metadata;
                if (metadata && metadata.compression) {
                    if (metadata.compression = 'gzip') {
                        this.cache = JSON.parse(await ungzip(Buffer.from(response.value, metadata.encoding)));
                    } else {
                        return reject(new Error(`${metadata.compression} is not a recognized compression type`));
                    }
                } else {
                    this.cache = JSON.parse(response.value);
                }
                let newDataExpires = false;
                if (this.cache.expiration) {
                    newDataExpires = new Date(this.cache.expiration).valueOf();
                }
                if (newDataExpires && this.dataExpires === newDataExpires) {
                    console.log(`${this.kvName} is still stale after re-load`);
                }
                this.dataExpires = newDataExpires;
                this.dataSource.setKvUsed(this.kvName);
                this.loading = false;
                resolve();
            }).catch(error => {
                this.loading = false;
                reject(error);
            });
        });
        return this.loading;
    }
}

module.exports = WorkerKV;
