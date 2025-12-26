import WorkerKV from './worker-kv.mjs';

class WorkerKVSplitLocale {
    constructor(kvName, dataSource, localeKvName) {
        this.cache = {};
        this.gameModes = ['regular'];
        this.localeKvName = localeKvName;
        this.kvs = {
            data: new WorkerKV(kvName, dataSource),
            locale: new WorkerKV(localeKvName, dataSource),
        };
    }
    
    addGameMode(gameMode) {
        this.gameModes.push(gameMode);
        for (const key in this.kvs) {
            this.kvs[key].gameModes.push(gameMode);
        }
    }

    async getCache(context, info) {
        const [ dataCache, localeCache ] = await Promise.all([
            this.kvs.data.getCache(context, info),
            this.kvs.locale.getCache(context, info),
        ]);
        return dataCache;
    }

    getGameMode(context, info) {
        return this.kvs.data.getGameMode(context, info);
    }

    getLocale(key, context, info) {
        if (!key) {
            return null;
        }
        const lang = context.util.getLang(info, context);
        const gameMode = this.getGameMode(context, info);
        const cache = this.kvs.locale.cache[gameMode];
        const getTranslation = (k) => {
            if (cache?.locale[lang] && typeof cache.locale[lang][k] !== 'undefined') {
                return cache.locale[lang][k];
            }
            if (cache?.locale.en && typeof cache.locale.en[k] !== 'undefined') {
                return cache.locale.en[k];
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
}

export default WorkerKVSplitLocale;
