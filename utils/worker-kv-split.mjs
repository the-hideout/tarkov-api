import WorkerKV from './worker-kv.mjs';

class WorkerKVSplit {
    constructor(kvName, dataSource, idLength = 1) {
        this.dataExpires = {};
        this.kvs = {};
        this.idLength = idLength;
        const hexKeys = [];
        const maxDecimalValue = parseInt('f'.padEnd(idLength, 'f'), 16);
        for (let i = 0; i <= maxDecimalValue; i++) {
            const hexValue = i.toString(16).padStart(idLength, '0');
            hexKeys.push(hexValue);
        }
        for (const hexKey of hexKeys) {
            this.kvs[hexKey] = new WorkerKV(`${kvName}_${hexKey}`, dataSource);
        }
        this.gameModes = ['regular'];
    }

    getIdSuffix(id) {
        return id.substring(id.length-this.idLength, id.length);
    }
    
    addGameMode(gameMode) {
        this.gameModes.push(gameMode);
        for (const key in this.kvs) {
            this.kvs[key].gameModes.push(gameMode);
        }
    }

    async getCache(context, info, id) {
        const kvId = this.getIdSuffix(id);
        if (!this.kvs[kvId]) {
            return Promise.reject(`${id} is not a valid id`);
        }
        return this.kvs[kvId].getCache(context, info).then((result) => {
            if (result.cache?.expiration) {
                this.dataExpires[result.gameMode] = new Date(result.cache.expiration).valueOf();
            }
            return result;
        });
    }

    clearRequestCache(requestId) {
        for (const worker of Object.values(this.kvs)) {
            worker.clearRequestCache(requestId);
        }
    }
}

export default WorkerKVSplit;
