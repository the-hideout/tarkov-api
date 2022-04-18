const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

const TradersAPI = require('./traders');
const tradersAPI = new TradersAPI();

class HideoutNewAPI {
    constructor(){
        this.cache = false;
    }

    async init(){
        if(this.cache){
          return true;
        }
    
        await itemsAPI.init();
        await tradersAPI.init();
    
        try {
            this.cache = await ITEM_DATA.get('HIDEOUT_DATA_V2', 'json');
        } catch (error){
            console.error(error);
        }
    }

    async formatStation(rawStation) {
        const station = {
            ...rawStation
        };
        /*station.modules = await Promise.all(station.stages.map(async stage => {
            return await this.formatModule(stage, station);
        }));*/
        station.levels = station.stages.map(stage => {
            return this.formatModule(stage, station);
        });

        return station;
    }

    async formatModule(rawModule, station = false) {
        if (!station) {
            for (const hideoutStation of this.cache.data) {
                for (const stage of hideoutStation.stages) {
                    if (stage.id === rawModule.id) {
                        station = hideoutStation;
                        break;
                    }
                }
                if (station) break;
            }
        }
        return {
            id: rawModule.id,
            name: station.name,
            level: rawModule.level,
            constructionTime: rawModule.constructionTime,
            description: rawModule.description,
            traderRequirements: await Promise.all(rawModule.traderRequirements.map(async (req) => {
                return {
                    id: req.id,
                    traderLevel: await tradersAPI.get(req.trader_id, req.level)
                }
            })),
            moduleRequirements: await Promise.all(rawModule.moduleRequirements.map(async (req) => {
                return {
                    id: req.id,
                    module: await this.getModuleByLevel(req.station_id, req.level),
                };
            })),
            itemRequirements: await Promise.all(rawModule.itemRequirements.map(async (itemRequirement) => {
                return {
                    id: itemRequirement.id,
                    item: await itemsAPI.getItem(itemRequirement.item_id),
                    quantity: itemRequirement.count,
                    count: itemRequirement.count,
                };
            })),
            skillRequirements: rawModule.skillRequirements
        };
    }

    async getList(){
        await this.init();
        if(this.stationList){
            return this.stationList;
        }

        await itemsAPI.init();

        const returnData = await Promise.all(this.cache.data.map(hideoutStation => {
            return this.formatStation(hideoutStation);
        }));
        /*const returnData = [];

        for (const hideoutStation of this.cache.data) {
            returnData.push(this.formatStation(hideoutStation));
        }*/

        this.stationList = returnData;

        return returnData;
    }

    async getModuleById(id) {
        await this.init();
        let station = false;
        let module = false;
        for (const hideoutStation of this.cache.data) {
            for (const stage of hideoutStation.stages) {
                if (stage.id === id) {
                    station = hideoutStation;
                    module = stage;
                    break;
                }
            }
            if (station) break;
        }
        return this.formatModule(module, station);
    }

    async getModuleByLevel(stationId, level) {
        await this.init();
        let station = false;
        let module = false;
        for (const hideoutStation of this.cache.data) {
            if (hideoutStation.id !== stationId) continue;
            station = hideoutStation;
            for (const stage of hideoutStation.stages) {
                if (stage.level === level) {
                    module = stage;
                    break;
                }
            }
            break;
        }
        if (!station || !module) throw new Error(`Could not find hideout station ${stationId} level ${level}`);
        return this.formatModule(module, station);
    }

    async getStation(id) {
        await this.init();
        for (const station of this.cache.data) {
            if (station.id === id) return this.formatStation(station);
        }
        return {};
    }
}

module.exports = HideoutNewAPI;
