class HideoutAPI {
    constructor(){
        this.cache = false;
    }

    async init(){
        if(this.cache){
          return true;
        }
    
        try {
            this.cache = await ITEM_DATA.get('HIDEOUT_DATA_V2', 'json');
        } catch (error){
            console.error(error);
        }
    }

    formatStation(rawStation) {
        return {
            ...rawStation,
            levels: rawStation.levels.map( stage => {
                return this.formatModule(stage, rawStation);
            })
        };
    }

    formatModule(rawModule, station = false) {
        if (!station) {
            for (const hideoutStation of this.cache.data) {
                for (const stage of hideoutStation.levels) {
                    if (stage.id === rawModule.id) {
                        station = hideoutStation;
                        break;
                    }
                }
                if (station) break;
            }
        }
        if (!station) return {};
        const module = {
            ...rawModule,
            name: station.name
        };
        return module;
    }

    async getList(){
        await this.init();
        if(this.stationList){
            return this.stationList;
        }

        const returnData = await Promise.all(this.cache.data.map(async hideoutStation => {
            return await this.formatStation(hideoutStation);
        }));

        this.stationList = returnData;

        return returnData;
    }

    async getModuleById(id) {
        await this.init();
        let station = false;
        let module = false;
        for (const hideoutStation of this.cache.data) {
            for (const stage of hideoutStation.levels) {
                if (stage.id === id) {
                    station = hideoutStation;
                    module = stage;
                    break;
                }
            }
            if (station) break;
        }
        return await this.formatModule(module, station);
    }

    async getModuleByLevel(stationId, level) {
        await this.init();
        let station = false;
        let module = false;
        for (const hideoutStation of this.cache.data) {
            if (hideoutStation.id !== stationId) continue;
            station = hideoutStation;
            for (const stage of hideoutStation.levels) {
                if (stage.level === level) {
                    module = stage;
                    break;
                }
            }
            break;
        }
        if (!station || !module) return {};//throw new Error(`Could not find hideout station ${stationId} level ${level}`);
        return this.formatModule(module, station);
    }

    async getStation(id) {
        await this.init();
        for (const station of this.cache.data) {
            if (station.id === id) return await this.formatStation(station);
        }
        return {};
    }
}

module.exports = HideoutAPI;
