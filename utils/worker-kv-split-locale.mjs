import WorkerKV from './worker-kv.mjs';

class WorkerKVSplitLocale {
    constructor(kvName, dataSource) {
        this.cache = {};
        this.gameModes = ['regular'];
        this.kvs = {
            data: new WorkerKV(kvName, dataSource),
            locale: new WorkerKV(`${kvName}_locale`, dataSource),
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
        return this.kvs.locale.getLocale(key, context, info);
    }
}

export default WorkerKVSplitLocale;
