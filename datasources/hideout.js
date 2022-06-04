class HideoutAPI {
    constructor(){
        this.cache = false;
        this.loading = false;
    }

    async init(){
        try {
            if (this.loading) {
                return new Promise((resolve) => {
                    const isDone = () => {
                        if (this.loading === false) {
                            resolve();
                        } else {
                            setTimeout(isDone, 5);
                        }
                    }
                    isDone();
                });
            }
            if(this.cache){
                return true;
            }
            this.loading = ITEM_DATA.get('HIDEOUT_DATA_V3', 'json');
            this.cache = await this.loading;
            this.loading = false;
        } catch (error){
            console.error(error);
        }
        if(!this.cache){
            return Promise.reject(new Error('Hideout cache failed to load'));
        }
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
        return Promise.reject(new Error(`No hideout station level found with id ${id}`));
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
        return Promise.reject(new Error(`No hideout station level found with id ${stationId} and level ${level}`));
    }

    async getStation(id) {
        await this.init();
        for (const station of this.cache.data) {
            if (station.id === id) return station;
        }
        return Promise.reject(new Error(`No hideout station found with id ${id}`));
    }
}

module.exports = HideoutAPI;
