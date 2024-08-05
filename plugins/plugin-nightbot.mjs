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

    if (env.SKIP_CACHE !== 'true') {
        const requestStart = new Date();
        const cachedResponse = await cacheMachine.get(env, 'nightbot', { q: url.searchParams.get('q'), l: url.searchParams.get('l') ?? 'en', m: url.searchParams.get('m') ?? 'regular' });
        if (cachedResponse) {
            // Construct a new response with the cached data
            const newResponse = new Response(cachedResponse);
            // Add a custom 'X-CACHE: HIT' header so we know the request hit the cache
            newResponse.headers.append('X-CACHE', 'HIT');
            console.log(`Request served from cache: ${new Date() - requestStart} ms`);
            // Return the new cached response
            return endResponse(newResponse);
        } else {
            console.log('no cached response');
        }
    } else {
        //console.log(`Skipping cache in ${ENVIRONMENT} environment`);
    }
    const data = new DataSource(env);
    const context = graphqlUtil.getDefaultContext(data);

    const info = {
        path: {
            key: 'query',
        },
        operation: {
            selectionSet: {
                selections: [
                    {
                        name: {
                            value: 'query'
                        },
                        arguments: [
                            {
                                name: {
                                    value: 'lang',
                                },
                                value: {
                                    value: url.searchParams.get('l') || 'en',
                                }
                            }
                        ]
                    },
                    {
                        name: {
                            value: 'query'
                        },
                        arguments: [
                            {
                                name: {
                                    value: 'gameMode',
                                },
                                value: {
                                    value: url.searchParams.get('m') || 'regular',
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    const items = await data.worker.item.getItemsByName(context, info, url.searchParams.get('q'));

    let responseBody = 'Found no item matching that name';

    if (items.length > 0) {
        const bestPrice = items[0].sellFor.sort((a, b) => b.price - a.price);
        const itemName = data.worker.item.getLocale(items[0].name, context, info);
        responseBody = `${itemName} ${new Intl.NumberFormat().format(bestPrice[0].price)} ₽ ${capitalize(bestPrice[0].source)} https://tarkov.dev/item/${items[0].normalizedName}`;
    }

    const ttl = data.getRequestTtl(context.requestId);
    delete data.requests[context.requestId];
    
    // Update the cache with the results of the query
    if (env.SKIP_CACHE !== 'true' && ttl > 0) {
        // using waitUntil doens't hold up returning a response but keeps the worker alive as long as needed
        const waitUntil = request.ctx?.waitUntil ?? serverContext.waitUntil;
        waitUntil(cacheMachine.put(env, 'nightbot', { q: url.searchParams.get('q'), l: url.searchParams.get('l') ?? 'en', m: url.searchParams.get('m') ?? 'regular' }, responseBody, String(ttl)));
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
