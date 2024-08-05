import { v4 as uuidv4 } from 'uuid';

import cacheMachine from '../utils/cache-machine.mjs';
import graphqlUtil from '../utils/graphql-util.mjs';

const skipCache = false; //ENVIRONMENT !== 'production' || false;

function capitalize(s) {
    return s && s[0].toUpperCase() + s.slice(1);
}

export default async function (request, data) {
    if (request.method.toUpperCase() !== 'GET') {
        return new Response(null, {
            status: 405,
            headers: { 'cache-control': 'public, max-age=2592000' },
        });
    }
    const requestId = uuidv4();
    const url = new URL(request.url);

    if (!url.searchParams.get('q')) {
        return new Response('Missing q param', {
            status: 405,
            headers: { 'cache-control': 'public, max-age=2592000' },
        });
    }

    if (!skipCache) {
        const cachedResponse = await cacheMachine.get(env, 'nightbot', { q: url.searchParams.get('q') });
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

    const context = graphqlUtil.getDefaultContext(data, requestId);
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
    const items = await data.item.getItemsByName(context, info, url.searchParams.get('q'));

    let responseBody = 'Found no item matching that name';

    if (items.length > 0) {
        const bestPrice = items[0].sellFor.sort((a, b) => b.price - a.price);
        const itemName = data.item.getLocale(items[0].name, context, info);
        responseBody = `${itemName} ${new Intl.NumberFormat().format(bestPrice[0].price)} ₽ ${capitalize(bestPrice[0].source)} https://tarkov.dev/item/${items[0].normalizedName}`;
    }

    const ttl = data.getRequestTtl(requestId);
    delete data.requests[requestId];

    // Update the cache with the results of the query
    const response = new Response(responseBody);
    if (!skipCache && ttl > 0) {
        // using waitUntil doens't hold up returning a response but keeps the worker alive as long as needed
        ctx.waitUntil(cacheMachine.put(env, 'nightbot', {q: url.searchParams.get('q')}, response, String(ttl)));
    }

    return response;
};
