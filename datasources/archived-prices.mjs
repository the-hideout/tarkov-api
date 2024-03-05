import WorkerKVSplit from '../utils/worker-kv-split.mjs';

class ArchivedPricesAPI extends WorkerKVSplit {
    constructor(dataSource) {
        super('archived_price_data', dataSource);
    }

    async getByItemId(context, itemId) {
        await this.init(context, itemId);
        const data = await this.getKVData(context, itemId);
        if (!data) {
            return Promise.reject(new Error('Archived prices data is empty'));
        }
        
        let prices = data.ArchivedPrices[itemId];
        if (!prices) {
            return [];
        }
        return prices;
    }
}

export default ArchivedPricesAPI;
