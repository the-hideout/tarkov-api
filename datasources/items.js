const numericMap = [
    'BlindnessProtection',
    'MaxDurability',
    'weaponErgonomicPenalty',
];

const stringMap = [
    'armorClass',
    'ArmorMaterial',
    'DeafStrength',
];

const arrayMap = [
    'armorZone',
    'headSegments',
];

const objectMap = [
    'RicochetParams',
];

class ItemsAPI {
  async getItem(id) {
    const item = await ITEM_DATA.get(id, 'json');

    if(!item){
        return false;
    }

    item.gameProperties = Object.entries(item.itemProperties).map((property) => {
        if(numericMap.includes(property[0])){
            return {
                key: property[0],
                numericValue: property[1],
            };
        }

        if(stringMap.includes(property[0])){
            return {
                key: property[0],
                stringValue: property[1],
            };
        }

        if(arrayMap.includes(property[0])){
            return {
                key: property[0],
                arrayValue: property[1],
            };
        }

        if(objectMap.includes(property[0])){
            return {
                key: property[0],
                objectValue: JSON.stringify(property[1]),
            };
        }
    });

    item.avg24hPrice = item.avg24Price;

    return item;
  }
}

module.exports = ItemsAPI
