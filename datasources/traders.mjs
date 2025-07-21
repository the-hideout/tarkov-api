import { GraphQLError } from 'graphql';

import WorkerKV from '../utils/worker-kv.mjs';

const currencyMap = {
    RUB: '5449016a4bdc2d6f028b456f',
    USD: '5696686a4bdc2da3298b456a',
    EUR: '569668774bdc2da2298b4568'
};

const dataIdMap = {
    0: '54cb50c76803fa8b248b4571',
    1: '54cb57776803fa99248b456e',
    2: '58330581ace78e27b8b10cee',
    3: '5935c25fb3acc3127c3d8cd9',
    4: '5a7c2eca46aef81a7ca2145d',
    5: '5ac3b934156ae10c4430e83c',
    6: '5c0647fdd443bc2504c2d371',
    7: '579dc571d53a0658a154fbec',
};

const traderNameIdMap = {
    'prapor': '54cb50c76803fa8b248b4571',
    'Prapor': '54cb50c76803fa8b248b4571',
    'therapist': '54cb57776803fa99248b456e',
    'Therapist': '54cb57776803fa99248b456e',
    'fence': '579dc571d53a0658a154fbec',
    'Fence': '579dc571d53a0658a154fbec',
    'skier': '58330581ace78e27b8b10cee',
    'Skier': '58330581ace78e27b8b10cee',
    'peacekeeper': '5935c25fb3acc3127c3d8cd9',
    'Peacekeeper': '5935c25fb3acc3127c3d8cd9',
    'mechanic': '5a7c2eca46aef81a7ca2145d',
    'Mechanic': '5a7c2eca46aef81a7ca2145d',
    'ragman': '5ac3b934156ae10c4430e83c',
    'Ragman': '5ac3b934156ae10c4430e83c',
    'jaeger': '5c0647fdd443bc2504c2d371',
    'Jaeger': '5c0647fdd443bc2504c2d371',
};

class TradersAPI extends WorkerKV {
    constructor(dataSource) {
        super('trader_data', dataSource);
        this.gameModes.push('pve');
    }

    async getList(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.Trader;
    }

    async get(context, info, id) {
        const { cache } = await this.getCache(context, info);
        for (const trader of cache.Trader) {
            if (trader.id === id) {
                return trader;
            }
        }

        return Promise.reject(new GraphQLError(`No trader found with id ${id}`));
    }

    async getByName(context, info, name) {
        const { cache } = await this.getCache(context, info);
        for (const trader of cache.Trader) {
            if (this.getLocale(trader.name, context, info).toLowerCase() === name.toLowerCase()) {
                return trader;
            }
        }

        return Promise.reject(new GraphQLError(`No trader found with name ${name}`));
    }

    async getByLevel(context, info, traderId, level) {
        const { cache } = await this.getCache(context, info);
        for (const trader of cache.Trader) {
            if (trader.id !== traderId) continue;
            for (const rawLevel of trader.levels) {
                if (rawLevel.level === level) {
                    return rawLevel;
                }
            }
        }
        return Promise.reject(new GraphQLError(`No trader found with id ${traderId} and level ${level}`));
    }

    getByDataId(context, info, dataId) {
        return this.get(context, info, dataIdMap[dataId]);
    }

    async getTraderResets(context, info) {
        const { cache } = await this.getCache(context, info);
        return cache.Trader.map(trader => {
            return {
                name: this.getLocale(trader.name, context, info).toLowerCase(),
                resetTimestamp: trader.resetTime,
            }
        });
    }

    getCurrencyMap() {
        return currencyMap;
    }

    getDataIdMap() {
        return dataIdMap;
    }

    getNameIdMap() {
        return traderNameIdMap;
    }
}

export default TradersAPI;
