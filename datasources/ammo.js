// datasource for ammo
const WorkerKV = require('../utils/worker-kv');

class AmmoAPI extends WorkerKV {
    constructor() {
        super('AMMO_DATA');
    }

    async getList() {
        await this.init();
        return this.cache.data;
    }
}

module.exports = AmmoAPI;
