// datasource for ammo
const WorkerKV = require('../utils/worker-kv');

class AmmoAPI extends WorkerKV {
    constructor() {
        super('ammo_data');
    }

    async getList() {
        await this.init();
        return this.cache.data;
    }
}

module.exports = AmmoAPI;
