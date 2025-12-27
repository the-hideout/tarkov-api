import { GraphQLError } from 'graphql';

import WorkerKV from '../utils/worker-kv.mjs';

class ItemsLocaleAPI extends WorkerKV {
    constructor(dataSource) {
        super('items_locale_data', dataSource);
        this.gameModes.push('pve');
    }

    async getLocale(key, context, info) {
        await this.getCache(context, info);
        return super.getLocale(key, context, info);
    }
}

export default ItemsLocaleAPI;
