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
        return {};
    }

    // item.gameProperties = Object.entries(item.itemProperties).map((property) => {
    //     if(numericMap.includes(property[0])){
    //         return {
    //             key: property[0],
    //             numericValue: property[1],
    //         };
    //     }

    //     if(stringMap.includes(property[0])){
    //         return {
    //             key: property[0],
    //             stringValue: property[1],
    //         };
    //     }

    //     if(arrayMap.includes(property[0])){
    //         return {
    //             key: property[0],
    //             arrayValue: property[1],
    //         };
    //     }

    //     if(objectMap.includes(property[0])){
    //         return {
    //             key: property[0],
    //             objectValue: JSON.stringify(property[1]),
    //         };
    //     }
    // });

    if(typeof item.avg24hPrice === 'undefined' && item.avg24Price){
        item.avg24hPrice = item.avg24Price;
    }

    item.iconLink = item.icon_link;
    item.imageLink = item.image_link;
    item.basePrice = item.base_price;
    item.shortName = item.shortname;
    item.wikiLink = item.wiki_link;

    if(item.properties){
        if(item.properties.Accuracy){
            item.accuracyModifier = item.properties.Accuracy;
        }

        if(item.properties.Recoil){
            item.recoilModifier = item.properties.Recoil;
        }

        if(item.properties.Ergonomics){
            item.ergonomicsModifier = item.properties.Ergonomics;
        }
    }

    return item;
  }
}

module.exports = ItemsAPI
