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
        this.loadingPromises = {};
        this.loadingInterval = false;
        this.dataExpires = false;
        this.dataSource = dataSource;
    }

    async init(context) {
        const requestId = typeof context === 'object' ? context.requestId : context;
        if (this.cache && (!this.dataExpires || new Date() < this.dataExpires)) {
            //console.log(`${this.kvName} is fresh; not refreshing`);
            this.dataSource.setKvUsedForRequest(this.kvName, requestId);
            return;
        }
        if (this.dataSource.kvLoadedForRequest(this.kvName, requestId)) {
            //console.log(`${this.kvName} already loaded for request ${requestId}; not refreshing`);
            return;
        }
        if (this.cache) {
            console.log(`${this.kvName} is stale; re-loading`);
            this.cache = false;
            this.loading = false;
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
                    if (this.loading === false) {
                        clearTimeout(loadingTimeout);
                        clearInterval(loadingInterval);
                        console.log(`${this.kvName} load: ${new Date() - startLoad} ms (secondary)`);
                        delete this.loadingPromises[requestId];
                        this.dataSource.setKvUsedForRequest(this.kvName, requestId);
                        return resolve();
                    }
                    if (loadingTimedOut) {
                        console.log(`${this.kvName} loading timed out; forcing load`);
                        clearInterval(loadingInterval);
                        this.loading = false;
                        delete this.loadingPromises[requestId];
                        return resolve(this.init(requestId));
                    }
                }, 100);
            });
            return this.loadingPromises[requestId];
        }
        this.loading = true;
        this.loadingPromises[requestId] = new Promise((resolve, reject) => {
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
                this.dataSource.setKvLoadedForRequest(this.kvName, requestId);
                this.loading = false;
                delete this.loadingPromises[requestId];
                this.postLoad();
                resolve();
            }).catch(error => {
                this.loading = false;
                reject(error);
            });
        });
        return this.loadingPromises[requestId];
    }

    getLocale(key, context, info) {
        if (!key) {
            return null;
        }
        const lang = context.util.getLang(info, context);
        const getTranslation = (k) => {
            if (this.cache.locale && this.cache.locale[lang] && typeof this.cache.locale[lang][k] !== 'undefined') {
                return this.cache.locale[lang][k];
            }
            if (this.cache.locale && this.cache.locale.en && typeof this.cache.locale.en[k] !== 'undefined') {
                return this.cache.locale.en[k];
            }
            const errorMessage = `Missing translation for key ${k}`;
            if (!context.errors.some(err => err.message === errorMessage)) {
                context.errors.push({message: errorMessage});
            }
            return k;
        };
        if (Array.isArray(key)) {
            return key.map(k => getTranslation(k)).filter(Boolean);
        }
        return getTranslation(key);
    }

    postLoad() { /* some KVs may require initial processing after retrieval */ }
}

module.exports = WorkerKV;
