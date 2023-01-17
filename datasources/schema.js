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
        return this.cache.itemCategories
    }

    async getHandbookCategories(requestId) {
        await this.init(requestId);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.handbookCategories;
    }

    async getItemTypes(requestId) {
        await this.init(requestId);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.itemTypes;
    }

    async getLanguageCodes(requestId) {
        await this.init(requestId);
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.languageCodes;
    }
}

module.exports = SchemaAPI;
