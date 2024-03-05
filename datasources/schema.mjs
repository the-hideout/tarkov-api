import WorkerKV from '../utils/worker-kv.mjs';

class SchemaAPI extends WorkerKV {
    constructor(dataSource) {
        super('schema_data', dataSource);
    }

    async getCategories(context) {
        await this.init(context);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.ItemCategory;
    }

    async getHandbookCategories(context) {
        await this.init(context);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.HandbookCategory;
    }

    async getItemTypes(context) {
        await this.init(context);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.ItemType;
    }

    async getLanguageCodes(context) {
        await this.init(context);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.LanguageCode;
    }
}

export default SchemaAPI;
