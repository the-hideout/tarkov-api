import WorkerKV from '../utils/worker-kv.mjs';

class StatusAPI extends WorkerKV {
    constructor(dataSource) {
        super('status_data', dataSource);
    }

    async getStatus(context) {
        await this.init(context);
        if (!this.cache) {
            return Promise.reject(new Error('Status cache is empty'));
        }
        return this.cache.ServerStatus;
    }
}

export default StatusAPI;
