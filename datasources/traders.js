const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

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

class TradersAPI {
    constructor(){
        this.traderCache = false;
        this.resetCache = false;
    }

    async init(){
        if(this.traderCache && this.resetCache){
          return true;
        }
    
        await itemsAPI.init();
    
        try {
            this.traderCache = await ITEM_DATA.get('TRADER_DATA', 'json');
            this.resetCache = await ITEM_DATA.get('RESET_TIMES', 'json');
        } catch (error){
            console.error(error);
        }
    }

    formatTrader(rawTrader) {
        const trader = {
            id: rawTrader.id,
            name: rawTrader.name,
            resetTime: rawTrader.resetTime,
            currency: await itemsAPI.getItem(currencyMap[rawTrader.currency]),
            levels: rawTrader.levels
        };
        if (this.resetCache[rawTrader.name.toLowerCase()]) trader.resetTime = this.resetCache[rawTrader.name.toLowerCase()];
        return rawTrader;
    }

    getList() {
        await this.init();

        if(this.traderList){
            return this.traderList;
        }

        await itemsAPI.init();

        const returnData = [];
        for(const trader of this.traderCache.data){
            returnData.push(this.formatTrader(trader));
        }

        this.traderList = returnData;

        return returnData;
    }

    get(id) {
        await this.init();
        for(const trader of this.traderCache.data){
            if(trader.id === id){
                return this.formatTrader(trader);
            }
        }

        return {};
    }

    getByName(name) {
        await this.init();
        for(const trader of this.traderCache.data){
            if(trader.name.toLowerCase() === name.toLowerCase()){
                return this.formatTrader(trader);
            }
        }

        return {};
    }

    getByLevel(traderId, level) {
        await this.init();
        for (const rawTrader of this.traderCache.data) {
            if (rawTrader.id !== traderId) continue;
            for (const rawLevel of hideoutStation.levels) {
                if (rawLevel.level === level) {
                    return rawLevel;
                }
            }
        }
        throw new Error(`Could not find trader ${traderId} level ${level}`);
    }

    getByDataId(dataId) {
        return this.get(dataIdMap[dataId]);
    }
}

module.exports = TradersAPI;