import { GraphQLError } from 'graphql';

import WorkerKV from '../utils/worker-kv.mjs';

class SchemaAPI extends WorkerKV {
    constructor(dataSource) {
        super('schema_data', dataSource);
    }

    async getCategories(context) {
        const { cache } = await this.getCache(context);
        if (!cache) {
            return Promise.reject(new GraphQLError('Schema cache is empty'));
        }
        return cache.ItemCategory;
    }

    async getHandbookCategories(context) {
        const { cache } = await this.getCache(context);
        if (!cache) {
            return Promise.reject(new GraphQLError('Schema cache is empty'));
        }
        return cache.HandbookCategory;
    }

    async getItemTypes(context) {
        const { cache } = await this.getCache(context);
        if (!cache) {
            return Promise.reject(new GraphQLError('Schema cache is empty'));
        }
        return cache.ItemType;
    }

    async getLanguageCodes(context) {
        const { cache } = await this.getCache(context);
        if (!cache) {
            return Promise.reject(new GraphQLError('Schema cache is empty'));
        }
        return cache.LanguageCode;
    }
}

export default SchemaAPI;
