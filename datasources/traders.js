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

class TradersAPI {
    constructor(){
        this.traderCache = false;
    }

    async init(){
        if(this.traderCache){
          return true;
        }
    
        try {
            this.traderCache = await ITEM_DATA.get('TRADER_DATA', 'json');
        } catch (error){
            console.error(error);
        }
    }

    async formatTrader(rawTrader) {
        const trader = {
            ...rawTrader
        };
        return trader;
    }

    async getList() {
        await this.init();
        if(this.traderList){
            return this.traderList;
        }
        if (!this.traderCache) return {};
        const returnData = [];
        for(const trader of this.traderCache.data){
            returnData.push(this.formatTrader(trader));
        }

        this.traderList = await Promise.all(returnData);

        return this.traderList;
    }

    async get(id) {
        await this.init();
        if (!this.traderCache) return {};
        for(const trader of this.traderCache.data){
            if(trader.id === id){
                return this.formatTrader(trader);
            }
        }

        return {};
    }

    async getByName(name) {
        await this.init();
        if (!this.traderCache) return {};
        for(const trader of this.traderCache.data){
            if(trader.name.toLowerCase() === name.toLowerCase()){
                return this.formatTrader(trader);
            }
        }

        return {};
    }

    async getByLevel(traderId, level) {
        await this.init();
        if (!this.traderCache) return {};
        for (const rawTrader of this.traderCache.data) {
            if (rawTrader.id !== traderId) continue;
            for (const rawLevel of rawTrader.levels) {
                if (rawLevel.level === level) {
                    return rawLevel;
                }
            }
        }
        console.log(`no trader found for ${traderId}, ${level}`);
        return {};
    }

    getByDataId(dataId) {
        return this.get(dataIdMap[dataId]);
    }

    async getTraderResets() {
        await this.init();
        try {
            const returnData = [];
    
            for (const trader of this.traderCache.data) {
                returnData.push({
                    name: trader.name.toLowerCase(),
                    resetTimestamp: trader.resetTime,
                });
            }
    
            return returnData;
        } catch (loadDataError){
            console.error(loadDataError);
    
            return [];
        }
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

module.exports = TradersAPI;