class HideoutLegacyAPI {
    constructor(){
        this.moduleList = false;
    }

    async getList(){
        if(this.moduleList){
            return this.moduleList;
        }

        const hideoutData = await ITEM_DATA.get('HIDEOUT_DATA', 'json');
        const returnData = [];

        for(const hideoutModule of hideoutData.data){
            const newRequirement = {
                id: hideoutModule.id,
                name: hideoutModule.module,
                level: hideoutModule.level,
                itemRequirements: hideoutModule.require.map((hideoutRequirement) => {
                    if(hideoutRequirement.type !== 'item'){
                        return false;
                    }

                    return {
                        item: hideoutRequirement.name,
                        quantity: hideoutRequirement.quantity,
                        count: hideoutRequirement.quantity,
                    };
                }),
                moduleRequirements: hideoutModule.require.map((hideoutRequirement) => {
                    if(hideoutRequirement.type !== 'module'){
                        return false;
                    }

                    return {
                        name: hideoutRequirement.name,
                        level: hideoutRequirement.quantity,
                    };
                }).filter(Boolean),
            };

            newRequirement.itemRequirements = newRequirement.itemRequirements.filter(Boolean);
            returnData.push(newRequirement);
        }

        for(const hideoutModule of returnData){
            hideoutModule.moduleRequirements = hideoutModule.moduleRequirements.map((basicModuleObject) => {
                return this.getModule(basicModuleObject.name, basicModuleObject.level, returnData);
            });
        }

        this.moduleList = returnData;

        return returnData;
    }

    async getModule(name, level, moduleList) {
        return moduleList.find(hideoutModule => hideoutModule.name === name && hideoutModule.level === level);
    }
}

module.exports = HideoutLegacyAPI
