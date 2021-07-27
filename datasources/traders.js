const traders = {
    "54cb50c76803fa8b248b4571": {
        "id": "54cb50c76803fa8b248b4571",
        "name": "Prapor",
        "dataId": 0,
    },
    "54cb57776803fa99248b456e": {
        "id": "54cb57776803fa99248b456e",
        "name": "Therapist",
        "dataId": 1,
    },
    "58330581ace78e27b8b10cee": {
        "id": "58330581ace78e27b8b10cee",
        "name": "Skier",
        "dataId": 2
    },
    "5935c25fb3acc3127c3d8cd9": {
        "id": "5935c25fb3acc3127c3d8cd9",
        "name": "Peacekeeper",
        "dataId": 3
    },
    "5a7c2eca46aef81a7ca2145d": {
        "id": "5a7c2eca46aef81a7ca2145d",
        "name": "Mechanic",
        "dataId": 4
    },
    "5ac3b934156ae10c4430e83c": {
        "id": "5ac3b934156ae10c4430e83c",
        "name": "Ragman",
        "dataId": 5
    },
    "5c0647fdd443bc2504c2d371": {
        "id": "5c0647fdd443bc2504c2d371",
        "name": "Jaeger",
        "dataId": 6
    },
    "579dc571d53a0658a154fbec": {
        "id": "579dc571d53a0658a154fbec",
        "name": "Fence",
        "dataId": 7
    }
};

class TradersAPI {
  get(id) {
    if(!traders){
        return {};
    }

    return traders[id];
  }

  getByName(name) {
    if(!traders){
        return {};
    }

    for(const traderId in traders){
        if(traders[traderId].name === name){
            return traders[traderId];
        }

        if(traders[traderId].name.toLowerCase() === name){
            return traders[traderId];
        }
    }

    return {};
  }

  getByDataId(dataId) {
    if(!traders){
        return {};
    }

    for(const traderId in traders){
        if(traders[traderId].dataId === dataId){
            return traders[traderId];
        }
    }

    return {};
  }
}

module.exports = TradersAPI;