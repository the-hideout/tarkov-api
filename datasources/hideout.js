class HideoutAPI {
    constructor(){
        this.cache = false;
        this.loading = false;
    }

    async init(){
        try {
            if (this.loading) await this.loading;
            if(this.cache){
                return true;
            }
            this.loading = ITEM_DATA.get('HIDEOUT_DATA_V3', 'json');
            this.cache = await this.loading;
            this.loading = false;
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
        return this.cache.data;
    }

    async getModuleById(id) {
        await this.init();
        for (const hideoutStation of this.cache.data) {
            for (const stage of hideoutStation.levels) {
                if (stage.id === id) {
                    return stage;
                }
            }
        }
        return {};
    }

    async getModuleByLevel(stationId, level) {
        await this.init();
        for (const hideoutStation of this.cache.data) {
            if (hideoutStation.id !== stationId) continue;
            for (const stage of hideoutStation.levels) {
                if (stage.level === level) {
                    return stage;
                }
            }
        }
        return {};
    }

    async getStation(id) {
        await this.init();
        for (const station of this.cache.data) {
            if (station.id === id) return station;
        }
        return {};
    }
}

module.exports = HideoutAPI;
