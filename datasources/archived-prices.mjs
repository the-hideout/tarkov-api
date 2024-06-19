import WorkerKVSplit from '../utils/worker-kv-split.mjs';

class ArchivedPricesAPI extends WorkerKVSplit {
    constructor(dataSource) {
        super('archived_price_data', dataSource);
        this.gameModes.push('pve');
    }

    async getByItemId(context, info, itemId) {
        const { cache } = await this.getCache(context, info, itemId);
        if (!cache) {
            return Promise.reject(new Error('Archived prices data is empty'));
        }
        
        let prices = cache.ArchivedPrices[itemId];
        if (!prices) {
            return [];
        }
        return prices;
    }
}

export default ArchivedPricesAPI;
