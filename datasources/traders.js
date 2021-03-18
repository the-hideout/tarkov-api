class TradersAPI {
  async get(id) {
    const traders = await ITEM_DATA.get('TRADER_DATA', 'json');

    if(!traders){
        return {};
    }

    return traders[id];
  }

  async getByName(name) {
    const traders = await ITEM_DATA.get('TRADER_DATA', 'json');

    if(!traders){
        return {};
    }

    for(const trader of traders){
        if(trader.name === name){
            return trader;
        }
    }

    return {}
  }
}

module.exports = TradersAPI
