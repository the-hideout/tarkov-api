const ItemsAPI = require('../datasources/items');
const itemsAPI = new ItemsAPI();

module.exports = async (request) => {
    await itemsAPI.init();
    const url = new URL(request.url);

    if(!url.searchParams.get('q')){
        return new Response(`Missing a query param called q`);
    }

    const items = itemsAPI.getItemsByName(url.searchParams.get('q'));

    if(items.length === 0){
        return new Response(`Found no item matching that name`);
    }

    return new Response(`${items[0].name} ${items[0].avg24hPrice}₽ https://tarkov-tools.com/item/${items[0].normalizedName}`);
};