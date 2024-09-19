import cacheMachine from '../utils/cache-machine.mjs';
import DataSource from '../datasources/index.mjs';
import graphqlUtil from '../utils/graphql-util.mjs';

export const liteApiPathRegex = /\/api\/v1(?<gameMode>\/\w+)?\/(?<endpoint>item[\w\/]*)/;

export function useLiteApiOnUrl(url) {
    return !!url.pathname.match(liteApiPathRegex);
};

const currencyMap = {
    RUB: '₽',
    USD: '$',
    EUR: '€',
};

export async function getLiteApiResponse(request, url, env, serverContext) {
    let q, lang, uid, tags, sort, sort_direction;
    if (request.method.toUpperCase() === 'GET') {
        q = url.searchParams.get('q');
        lang = url.searchParams.get('lang') ?? 'en';
        uid = url.searchParams.get('uid');
        tags = url.searchParams.get('tags')?.split(',');
        sort = url.searchParams.get('sort');
        sort_direction = url.searchParams.get('sort_direction');
    } else if (request.method.toUpperCase() === 'POST') {
        const body = await request.json();
        q = body.q;
        lang = body.lang ?? 'en';
        uid = body.uid;
        tags = body.tags?.split(',');
        sort = body.sort;
        sort_direction = body.sort_direction;
    } else {
        return new Response(null, {
            status: 405,
            headers: { 'cache-control': 'public, max-age=2592000' },
        });
    }

    const pathInfo = url.pathname.match(liteApiPathRegex);

    const gameMode = pathInfo.groups.gameMode || 'regular';

    const endpoint = pathInfo.groups.endpoint;

    let key;
    if (env.SKIP_CACHE !== 'true' && !request.headers.has('cache-check-complete')) {
        const requestStart = new Date();
        key = await cacheMachine.createKey(env, url.pathname, { q, lang, gameMode, uid, tags, sort, sort_direction });
        const cachedResponse = await cacheMachine.get(env, {key});
        if (cachedResponse) {
            // Construct a new response with the cached data
            const newResponse = new Response(cachedResponse);
            // Add a custom 'X-CACHE: HIT' header so we know the request hit the cache
            newResponse.headers.append('X-CACHE', 'HIT');
            console.log(`Request served from cache: ${new Date() - requestStart} ms`);
            // Return the new cached response
            request.cached = true;
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

    function toLiteApiItem(item) {
        const bestTraderSell = item.traderPrices.reduce((best, current) => {
            if (!best || current.priceRUB > best.priceRUB) {
                return current;
            }
            return best;
        }, undefined);
        return {
            uid: item.id,
            name: data.worker.item.getLocale(item.name, context, info),
            tags: item.types,
            shortName: data.worker.item.getLocale(item.shortName, context, info),
            price: item.lastLowPrice,
            basePrice: item.basePrice,
            avg24hPrice: item.avg24hPrice,
            //avg7daysPrice: null,
            traderName: bestTraderSell ? bestTraderSell.name : null,
            traderPrice: bestTraderSell ? bestTraderSell.price : null,
            traderPriceCur: bestTraderSell ? currencyMap[bestTraderSell.currency] : null,
            updated: item.updated,
            slots: item.width * item.height,
            diff24h: item.changeLast48h,
            //diff7days: null,
            icon: item.iconLink,
            link: item.link,
            wikiLink: item.wikiLink,
            img: item.gridImageLink,
            imgBig: item.inspectImageLink,
            img512: item.image512pxLink,
            image8x: item.image8xLink,
            bsgId: item.id,
            isFunctional: true, // !item.types.includes('gun'),
            reference: 'https://tarkov.dev',
        };
    }

    let items, ttl;
    const responseOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };
    try {
        if (endpoint.startsWith('items')) {
            items = await data.worker.item.getAllItems(context, info);
            if (endpoint.endsWith('/download')) {
                responseOptions.headers['Content-Disposition'] = 'attachment; filename="items.json"';
            }
            if (tags) {
                items = await data.worker.item.getItemsByTypes(context, info, tags, items);
            }
        }
        if (!items && endpoint.startsWith('item')) {
            if (!q && !uid) {
                throw new Error('The item request requires either a q or uid parameter');
            }
            if (q) {
                items = await data.worker.item.getItemsByName(context, info, q);
            } else if (uid) {
                items = [await data.worker.item.getItem(context, info, uid)];
            }
        }
        items = items.map(toLiteApiItem);
        ttl = data.getRequestTtl(context.requestId);
    } catch (error) {
        return new Response(error.message, {status: 400});
    } finally {
        data.clearRequestData(context.requestId);
    }
    if (sort && items?.length) {
        items.sort((a, b) => {
            let aValue = sort_direction === 'desc' ? b[sort] : a[sort];
            let bValue = sort_direction === 'desc' ? a[sort] : b[sort];
            if (sort === 'updated') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            }
            if (typeof aValue === 'string') {
                return aValue.localeCompare(bValue, lang);
            }
            return aValue - bValue;
        });
    }
    const responseBody = JSON.stringify(items ?? [], null, 4);
    
    // Update the cache with the results of the query
    if (env.SKIP_CACHE !== 'true' && ttl > 0) {
        const putCachePromise = cacheMachine.put(env, responseBody, { key, query: url.pathname, variables: { q, lang, gameMode, uid, tags, sort, sort_direction }, ttl: String(ttl)});
        // using waitUntil doens't hold up returning a response but keeps the worker alive as long as needed
        if (request.ctx?.waitUntil) {
            request.ctx.waitUntil(putCachePromise);
        } else if (serverContext.waitUntil) {
            serverContext.waitUntil(putCachePromise);
        }
    }

    return new Response(responseBody, responseOptions);
}

export default function useLiteApi(env) {
    return {
        async onRequest({ request, url, endResponse, serverContext, fetchAPI }) {
            if (!useLiteApiOnUrl(url)) {
                return;
            }
            const response = await getLiteApiResponse(request, url, env, serverContext);
        
            endResponse(response);
        },
    }
}
