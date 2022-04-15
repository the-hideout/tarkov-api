// datasource for ammo

const ItemsAPI = require('./items');
const itemsAPI = new ItemsAPI();

class AmmoAPI {
  async getList() {
    const ammunition = await ITEM_DATA.get('AMMO_DATA', 'json');

    if(!ammunition){
        return {};
    }

    await itemsAPI.init();

    const returnData = [];

    for(const ammo of ammunition.data){
        const item = itemsAPI.getItem(ammo.id);
        if (!item) continue;
        if (!item.id) continue;
        returnData.push({
            item: item,
            weight: ammo.weight,
            caliber: ammo.caliber,
            stackMaxSize: ammo.stackMaxSize,
            tracer: ammo.tracer,
            tracerColor: ammo.tracerColor,
            ammoType: ammo.ammoType,
            projectileCount: ammo.projectileCount,
            damage: ammo.damage,
            armorDamage: ammo.armorDamage,
            fragmentationChance: ammo.fragmentationChance,
            ricochetChance: ammo.ricochetChance,
            penetrationChance: ammo.penetrationChance,
            penetrationPower: ammo.penetrationPower,
            accuracy: ammo.accuracy,
            recoil: ammo.recoil,
            initialSpeed: ammo.initialSpeed,
            heavyBleedModifier: ammo.heavyBleed,
            lightBleedModifier: ammo.lightBleed
        });
    }

    return returnData;
  }
}

module.exports = AmmoAPI
