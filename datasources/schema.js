const WorkerKV = require('../utils/worker-kv');

class SchemaAPI extends WorkerKV {
    constructor(dataSource) {
        super('schema_data', dataSource);
    }

    async getCategories(requestId) {
        await this.init(requestId);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.ItemCategory;
    }

    async getHandbookCategories(requestId) {
        await this.init(requestId);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.HandbookCategory;
    }

    async getItemTypes(requestId) {
        await this.init(requestId);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.ItemType;
    }

    async getLanguageCodes(requestId) {
        await this.init(requestId);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.LanguageCode;
    }
}

module.exports = SchemaAPI;
