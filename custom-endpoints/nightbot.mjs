import { v4 as uuidv4 } from 'uuid';

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

    const context = {
        data,
        util: graphqlUtil,
        requestId,
        lang: {},
        warnings: [],
        errors: [],
    };
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
                                    value: url.searchParams.get('l') || 'en'
                                }
                            }
                        ]
                    }
                ]
            }
        }
    };
    const items = await data.item.getItemsByName(context, url.searchParams.get('q'), info);

    let responseBody = 'Found no item matching that name';

    if (items.length > 0) {
        const bestPrice = items[0].sellFor.sort((a, b) => b.price - a.price);
        const itemName = data.item.getLocale(items[0].name, context, info);
        responseBody = `${itemName} ${new Intl.NumberFormat().format(bestPrice[0].price)} ₽ ${capitalize(bestPrice[0].source)} https://tarkov.dev/item/${items[0].normalizedName}`;
    }

    let ttl = data.getRequestTtl(requestId);
    if (ttl < 30) {
        ttl = 30;
    }
    delete data.requests[requestId];

    // Update the cache with the results of the query
    // don't update cache if result contained errors
    const response = new Response(responseBody);
    if (!skipCache && ttl > 0) {
        response.headers.set('cache-ttl', String(ttl));
    }

    return response;
};
