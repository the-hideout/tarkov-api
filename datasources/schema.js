const WorkerKV = require('../utils/worker-kv');

class SchemaAPI extends WorkerKV {
    constructor(dataSource) {
        super('schema_data', dataSource);
    }

    async getCategories() {
        await this.init();
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.ItemCategory;
    }

    async getHandbookCategories() {
        await this.init();
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.HandbookCategory;
    }

    async getItemTypes() {
        await this.init();
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.ItemType;
    }

    async getLanguageCodes() {
        await this.init();
        if (!this.cache) {
            return Promise.reject(new Error('Schema cache is empty'));
        }
        return this.cache.LanguageCode;
    }
}

module.exports = SchemaAPI;
