const WorkerKV = require('./worker-kv');

class WorkerKVSplit {
    constructor(kvName, dataSource, idLength = 1) {
        this.dataExpires = false;
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
    }

    getIdSuffix(id) {
        return id.substring(id.length-this.idLength, id.length);
    }

    async init(context, id) {
        const kvId = this.getIdSuffix(id);
        return this.kvs[kvId].init(context).then(() => {
            if (this.kvs[kvId].cache?.expiration) {
                this.dataExpiress = new Date(this.kvs[kvId].cache.expiration).valueOf();
            }
        });
    }

    async getKVData(context, id) {
        await this.init(context, id);
        const kvId = this.getIdSuffix(id);
        return this.kvs[kvId].cache;
    }
}

module.exports = WorkerKVSplit;
