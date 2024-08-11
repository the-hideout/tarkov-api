import cacheMachine from '../utils/cache-machine.mjs';
import DataSource from '../datasources/index.mjs';
import graphqlUtil from '../utils/graphql-util.mjs';

function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}

const usePaths = [
    '/webhook/nightbot',
    '/webhook/stream-elements',
    '/webhook/moobot',
];

export async function getNightbotResponse(request, url, env, serverContext) {
    if (request.method.toUpperCase() !== 'GET') {
        return new Response(null, {
            status: 405,
            headers: { 'cache-control': 'public, max-age=2592000' },
        });
    }

    if (!url.searchParams.get('q')) {
        return new Response('Missing q param', {
            status: 405,
            headers: { 'cache-control': 'public, max-age=2592000' },
        });
    }

    const lang = url.searchParams.get('l') || 'en';
    const gameMode = url.searchParams.get('m') || 'regular';
    const query = url.searchParams.get('q');

    if (env.SKIP_CACHE !== 'true') {
        const requestStart = new Date();
        const cachedResponse = await cacheMachine.get(env, 'nightbot', { q: query, l: lang, m: gameMode });
        if (cachedResponse) {
            // Construct a new response with the cached data
            const newResponse = new Response(cachedResponse);
            // Add a custom 'X-CACHE: HIT' header so we know the request hit the cache
            newResponse.headers.append('X-CACHE', 'HIT');
            console.log(`Request served from cache: ${new Date() - requestStart} ms`);
            // Return the new cached response
            return newResponse;
        } else {
            console.log('no cached response');
        }
    } else {
        //console.log(`Skipping cache in ${ENVIRONMENT} environment`);
    }
    const data = new DataSource(env);
    const context = graphqlUtil.getDefaultContext(data);

    const info = graphqlUtil.getGenericInfo(lang, gameMode);
    let items, ttl;
    let responseBody = 'Found no item matching that name';
    try {
        items = await data.worker.item.getItemsByName(context, info, query);
        ttl = data.getRequestTtl(context.requestId)
    
        if (items.length > 0) {
            const bestPrice = items[0].sellFor.sort((a, b) => b.price - a.price);
            const itemName = data.worker.item.getLocale(items[0].name, context, info);
            responseBody = `${itemName} ${new Intl.NumberFormat().format(bestPrice[0].price)} ₽ ${capitalize(bestPrice[0].source)} https://tarkov.dev/item/${items[0].normalizedName}`;
        }
    } catch (error) {
        throw (error);
    } finally {
        data.clearRequestData(context.requestId);
    }
    
    // Update the cache with the results of the query
    if (env.SKIP_CACHE !== 'true' && ttl > 0) {
        const putCachePromise = cacheMachine.put(env, 'nightbot', { q: query, l: lang, m: gameMode }, responseBody, String(ttl));
        // using waitUntil doens't hold up returning a response but keeps the worker alive as long as needed
        if (request.ctx?.waitUntil) {
            request.ctx.waitUntil(putCachePromise);
        } else if (serverContext.waitUntil) {
            serverContext.waitUntil(putCachePromise);
        }
    }
    return new Response(responseBody)
}

export default function useNightbot(env) {
    return {
        async onRequest({ request, url, endResponse, serverContext, fetchAPI }) {
            if (!usePaths.includes(url.pathname)) {
                return;
            }
            const response = await getNightbotResponse(request, url, env, serverContext);
        
            endResponse(response);
        },
    }
}
