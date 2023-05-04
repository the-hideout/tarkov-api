const WorkerKV = require('../utils/worker-kv');

const isAnyDogtag = id => {
    return id === '59f32bb586f774757e1e8442' || id === '59f32c3b86f77472a31742f0' || id === '5b9b9020e7ef6f5716480215';
};

const isBothDogtags = id => {
    return id === '5b9b9020e7ef6f5716480215';
};

class BartersAPI extends WorkerKV {
    constructor(dataSource) {
        super('barter_data', dataSource);
    }

    async getList() {
        await this.init();
        return this.cache.Barter;
    }

    async getBartersForItem(id) {
        await this.init();
        return this.cache.Barter.filter(barter => {
            for (const item of barter.rewardItems) {
                if (item.item === id) return true;
                if (item.baseId === id) return true;
            }
            return false;
        });
    }

    async getBartersUsingItem(id) {
        await this.init();
        return this.cache.Barter.filter(barter => {
            for (const item of barter.requiredItems) {
                if (item.item === id) return true;
                if (isBothDogtags(id) && isAnyDogtag(item.item)) {
                    return true;
                }
                if (isBothDogtags(item.item) && isAnyDogtag(id)) {
                    return true;
                }
            }
            return false;
        });
    }

    async getBartersForTrader(id) {
        await this.init();
        return this.cache.Barter.filter(barter => {
            if (barter.trader_id === id) return true;
            return false;
        });
    }

    async getBartersForTraderLevel(id, level) {
        await this.init();
        return this.cache.Barter.filter(barter => {
            if (barter.trader_id === id && barter.level === level) return true;
            return false;
        });
    }
}

module.exports = BartersAPI;
