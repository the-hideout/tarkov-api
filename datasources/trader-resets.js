module.exports = async () => {
    try {
        const resetTimes = await ITEM_DATA.get(`RESET_TIMES`, 'json');
        const returnData = [];

        //console.log(resetTimes);

        for(const trader in resetTimes){
            returnData.push({
                name: trader,
                resetTimestamp: resetTimes[trader],
            });
        }

        return returnData;
    } catch (loadDataError){
        console.error(loadDataError);

        return [];
    }
};
