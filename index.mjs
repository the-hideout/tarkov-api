/*import cacheMachine from './utils/cache-machine.mjs';
import getYoga from './graphql-yoga.mjs';
import graphQLOptions from './utils/graphql-options.mjs';

export default {
	async fetch(request, env, ctx) {
        try {
            const yoga = await getYoga({...env, RESPONSE_CACHE: cacheMachine});
            return yoga.fetch(request, {...env, ctx, RESPONSE_CACHE: cacheMachine});
        } catch (err) {
            console.log(err);
            return new Response(graphQLOptions.debug ? err : 'Something went wrong', { status: 500 });
        }
	},
};*/
import { graphql } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

import DataSource from './datasources/index.mjs';
//import playground from './handlers/playground.mjs';
import graphiql from './handlers/graphiql.mjs';
import setCors from './utils/setCors.mjs';
import schema from './schema.mjs';
import graphqlUtil from './utils/graphql-util.mjs';
import graphQLOptions from './utils/graphql-options.mjs';
import cacheMachine from './utils/cache-machine.mjs';
import cfCache from './utils/cf-cache.mjs';

import { getNightbotResponse, useNightbotOnUrl } from './plugins/plugin-nightbot.mjs';
import { getTwitchResponse } from './plugins/plugin-twitch.mjs';
import { getLiteApiResponse, useLiteApiOnUrl } from './plugins/plugin-lite-api.mjs';
import { getSpecialCache } from './plugins/plugin-use-cache-machine.mjs';

let dataAPI;

async function graphqlHandler(request, env, ctx) {
    const url = new URL(request.url);
    let query, variables;

    if (request.method === 'POST') {
        try {
            const requestBody = await request.json();
            query = requestBody.query;
            variables = requestBody.variables;
        } catch (jsonError) {
            console.error(jsonError);

            return new Response(null, {
                status: 400,
            });
        }
    } else if (request.method === 'GET') {
        query = url.searchParams.get('query');
        variables = url.searchParams.get('variables');
    } 

    // Check for empty /graphql query
    if (!query || query.trim() === '') {
        return new Response('GraphQL requires a query in the body of the request',
            {
                status: 400,
                headers: { 'cache-control': 'public, max-age=2592000' }
            }
        );
    }

    if (!dataAPI) {
        dataAPI = new DataSource(env);
    }

    const requestId = uuidv4();
    console.info(requestId);
    console.log(new Date().toLocaleString('en-US', { timeZone: 'UTC' }));
    console.log(`KVs pre-loaded: ${dataAPI.kvLoaded.join(', ') || 'none'}`);
    //console.log('query', query);
    //console.log('variables', variables);
    if (request.headers.has('x-newrelic-synthetics')) {
        console.log('NewRelic health check');
        //return new Response(JSON.stringify({}), responseOptions);
    }

    const specialCache = getSpecialCache(request);

    const key = await cacheMachine.createKey(env, query, variables, specialCache);
    // Check the cache service for data first - If cached data exists, return it
    // we don't check the cache if we're the http server because the worker already did
    if (env.SKIP_CACHE !== 'true' && env.SKIP_CACHE_CHECK !== 'true' && !env.CLOUDFLARE_TOKEN) {
        const cfCached = await cfCache.get(env, key);
        if (cfCached) {
            console.log('Request served from CF cache');
            return new Response(await cfCached.json(), {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
        }
        const cachedResponse = await cacheMachine.get(env, {key});
        if (cachedResponse) {
            // Construct a new response with the cached data
            const cachedJson = await cachedResponse.json();
            const newResponse = new Response(cachedJson, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CACHE': 'HIT', // we know request hit the cache
                    'Cache-Control': `public, max-age=${cachedResponse.headers.get('X-Cache-Ttl')}`,
                },
            });
            console.log('Request served from custom cache');
            // update CF cache
            const ttl = cachedResponse.headers.get('X-Cache-Ttl') ?? '300';
            ctx.waitUntil(cfCache.put(env, cachedJson, {key, ttl}));
            // Return the new cached response
            return newResponse;
        }
    } else {
        //console.log(`Skipping cache in ${ENVIRONMENT} environment`);
    }

    // if an origin server is configured, pass the request
    if (env.USE_ORIGIN === 'true') {
        try {
            const originUrl = new URL(request.url);
            originUrl.search = '';
            if (env.ORIGIN_OVERRIDE) {
                originUrl.host = env.ORIGIN_OVERRIDE;
            }
            if (env.ORIGIN_PROTOCOL) {
                originUrl.protocol = env.ORIGIN_PROTOCOL;
            } 
            console.log(`Querying origin server ${originUrl}`);
            const originResponse = await fetch(originUrl, {
                method: 'POST',
                body: JSON.stringify({
                    query,
                    variables,
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'cache-check-complete': 'true',
                },
                signal: AbortSignal.timeout(20000),
            });
            const originBody = await originResponse.text();
            if (originResponse.status !== 200) {
                throw new Error(`${originResponse.status} ${originBody}`);
            }
            console.log('Request served from origin server');
            const newResponse = new Response(originBody, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            let ttl = '300';
            if (originResponse.headers.has('X-Cache-Ttl')) {
                newResponse.headers.set('Cache-Control', `public, max-age=${originResponse.headers.get('X-Cache-Ttl')}`);
                ttl = originResponse.headers.get('X-Cache-Ttl');
            }
            // update CF cache
            ctx.waitUntil(cfCache.put(env, originBody, {key, ttl}));
            return newResponse;
        } catch (error) {
            console.error(`Error getting response from origin server: ${error}`);
        }
    }

    const context = graphqlUtil.getDefaultContext(dataAPI, requestId);
    let result, ttl;
    try {
        result = await graphql({schema: await schema(dataAPI, context), source: query, rootValue: {}, contextValue: context, variableValues: variables});
        ttl = dataAPI.getRequestTtl(requestId);
        //console.log(`${requestId} kvs loaded: ${dataAPI.requests[requestId].kvLoaded.join(', ')}`);
    } catch (error) {
        throw error;
    } finally {
        dataAPI.clearRequestData(requestId);
    }
    console.log('generated graphql response');
    if (context.errors.length > 0) {
        if (!result.errors) {
            result = Object.assign({errors: []}, result); // this puts the errors at the start of the result
        }
        result.errors.push(...context.errors);
    }
    if (context.warnings.length > 0) {
        if (!result.warnings) {
            result = Object.assign({warnings: []}, result);
        }
        result.warnings.push(...context.warnings);
    }

    if (result.errors?.some(err => err.message === 'Unexpected error.')) {
        ttl = 0;
    } else if (result.errors?.some(err => err.message.startsWith('Syntax Error'))) {
        ttl = 1800;
    } else if (specialCache === 'application/json') {
        if (!result.warnings) {
            result = Object.assign({warnings: []}, result);
        }
        ttl = 30 * 60;
        result.warnings.push({message: `Your request does not have a "content-type" header set to "application/json". Requests missing this header are limited to resposnes that update every ${ttl/60} minutes.`});
    } else if (ttl > 1800) {
        // if the ttl is greater than a half hour, limit it
        ttl = 1800;
    }

    const body = JSON.stringify(result);

    const response = new Response(body, {
        headers: {
            'Content-Type': 'application/json',
        },
    });
    if (ttl > 0) {
        response.headers.set('Cache-Control', `public, max-age=${ttl}`);
    }

    if (env.SKIP_CACHE !== 'true' && ttl > 0) {
        ctx.waitUntil(cacheMachine.put(env, body, {key, ttl}));
        ctx.waitUntil(cfCache.put(env, body, {key, ttl}));
    }

    return response;
}

export default {
	async fetch(request, env, ctx) {
        if (!graphQLOptions.cors.allowMethods.split(', ').includes(request.method.toUpperCase())) {
            const errorResponse = new Response(null, {
                status: 405,
                headers: { 'cache-control': 'public, max-age=2592000' },
            });
            setCors(errorResponse, graphQLOptions.cors);
            return errorResponse;
        }
        if (request.method.toUpperCase() === 'OPTIONS') {
            const optionsResponse = new Response(null, {
                headers: {
                    'cache-control': 'public, max-age=2592000',
                    'Access-Control-Max-Age': '86400',
                },
            });
            setCors(optionsResponse, graphQLOptions.cors);
            return optionsResponse;
        }
        const requestStart = new Date();
		const url = new URL(request.url);

        try {
            if (url.pathname === '/twitch') {
                const response = await getTwitchResponse(env);
                if (graphQLOptions.cors) {
                    setCors(response, graphQLOptions.cors);
                }
                return response;
            }

            if (url.pathname === graphQLOptions.playgroundEndpoint) {
                //response = playground(request, graphQLOptions);
                return graphiql(graphQLOptions);
            }
            
            if (useNightbotOnUrl(url)) {
                return await getNightbotResponse(request, url, env, ctx);
            }

            if (useLiteApiOnUrl(url)) {
                return await getLiteApiResponse(request, url, env, ctx);
            }

            if (url.pathname === graphQLOptions.baseEndpoint) {
                const response = await graphqlHandler(request, env, ctx);
                if (graphQLOptions.cors) {
                    setCors(response, graphQLOptions.cors);
                }
                return response;
            }

			return new Response('Not found', { status: 404 });
        } catch (err) {
            console.log(err);
            return new Response(graphQLOptions.debug ? err : 'Something went wrong', { status: 500 });
        } finally {
            console.log(`Response time: ${new Date() - requestStart} ms`);
        }
	},
};
