class TradersAPI {
  async get(id) {
    const traders = await ITEM_DATA.get('TRADER_DATA', 'json');

    if(!traders){
        return {};
    }

    return traders[id];
  }
}

module.exports = TradersAPI
