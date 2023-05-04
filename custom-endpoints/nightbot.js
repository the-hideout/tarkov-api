const { v4: uuidv4 } = require('uuid');

const DataSource = require('../datasources');
const cacheMachine = require('../utils/cache-machine');

const skipCache = false; //ENVIRONMENT !== 'production' || false;

function capitalize(s){
    return s && s[0].toUpperCase() + s.slice(1);
}

module.exports = async (event) => {
    const request = event.request;
    const requestStart = new Date();
    const requestId = uuidv4();
    const url = new URL(request.url);
    const data = new DataSource(requestId);

    if(!url.searchParams.get('q')){
        return new Response(`Missing a query param called q`);
    }

    // Check the cache service for data first - If cached data exists, return it
    if (!skipCache) {
        const cachedResponse = await cacheMachine.get('nightbot', {q: url.searchParams.get('q')});
        if (cachedResponse) {
            // Construct a new response with the cached data
            const newResponse = new Response(cachedResponse);
            // Add a custom 'X-CACHE: HIT' header so we know the request hit the cache
            newResponse.headers.append('X-CACHE', 'HIT');
            console.log(`Request served from cache: ${new Date() - requestStart} ms`);
            // Return the new cached response
            return newResponse;
        } else {
            console.log('no cached response')
        }
    } else {
        //console.log(`Skipping cache in ${ENVIRONMENT} environment`);
    }

    const items = await data.item.getItemsByName(url.searchParams.get('q'));

    let response = 'Found no item matching that name';

    if (items.length > 0) {
        const bestPrice = items[0].sellFor.sort((a, b) => b.price - a.price);
        response = `${items[0].name} ${new Intl.NumberFormat().format(bestPrice[0].price)} ₽ ${capitalize(bestPrice[0].source)} https://tarkov.dev/item/${items[0].normalizedName}`;
    }

    let ttl = data.getRequestTtl();
    if (ttl < 30) {
        ttl = 30;
    }

    // Update the cache with the results of the query
    // don't update cache if result contained errors
    if (!skipCache && ttl >= 30) {
        // using waitUntil doens't hold up returning a response but keeps the worker alive as long as needed
        event.waitUntil(cacheMachine.put('nightbot', {q: url.searchParams.get('q')}, response, String(ttl)));
    }

    return new Response(response);
};
