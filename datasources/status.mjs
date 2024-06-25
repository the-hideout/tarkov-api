import WorkerKV from '../utils/worker-kv.mjs';

class StatusAPI extends WorkerKV {
    constructor(dataSource) {
        super('status_data', dataSource);
    }

    async getStatus(context) {
        const { cache } = await this.getCache(context);
        if (!cache) {
            return Promise.reject(new Error('Status cache is empty'));
        }
        return cache.ServerStatus;
    }
}

export default StatusAPI;
