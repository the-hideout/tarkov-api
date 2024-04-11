import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { graphql } from 'graphql';
import { v4 as uuidv4 } from 'uuid';

import DataSource from './datasources/index.mjs';
import playground from './handlers/playground.mjs';
import setCors from './utils/setCors.mjs';
import typeDefs from './schema.mjs';
import dynamicTypeDefs from './schema_dynamic.mjs';
import resolvers from './resolvers/index.mjs';
import graphqlUtil from './utils/graphql-util.mjs';

import nightbot from './custom-endpoints/nightbot.mjs';
import twitch from './custom-endpoints/twitch.mjs';

let dataAPI;
let schema = false;
let loadingSchema = false;
let lastSchemaRefresh = 0;

const schemaRefreshInterval = 1000 * 60 * 10;

// If the environment is not production, skip using the caching service
const skipCache = false; //ENVIRONMENT !== 'production' || false;

// Example of how router can be used in an application
async function getSchema(data, context) {
    if (schema && new Date() - lastSchemaRefresh < schemaRefreshInterval) {
        return schema;
    }
    if (loadingSchema) {
        return new Promise((resolve) => {
            let loadingTimedOut = false;
            const loadingTimeout = setTimeout(() => {
                loadingTimedOut = true;
            }, 3100);
            const loadingInterval = setInterval(() => {
                if (loadingSchema === false) {
                    clearTimeout(loadingTimeout);
                    clearInterval(loadingInterval);
                    return resolve(schema);
                }
                if (loadingTimedOut) {
                    console.log(`Schema loading timed out; forcing load`);
                    clearInterval(loadingInterval);
                    loadingSchema = false;
                    return resolve(getSchema(data, context));
                }
            }, 100);
        });
    }
    loadingSchema = true;
    return dynamicTypeDefs(data, context).catch(error => {
        loadingSchema = false;
        console.error('Error loading dynamic type definitions', error);
        return Promise.reject(error);
    }).then(dynamicDefs => {
        let mergedDefs;
        try {
            mergedDefs = mergeTypeDefs([typeDefs, dynamicDefs]);
        } catch (error) {
            console.error('Error merging type defs', error);
            return Promise.reject(error);
        }
        try {
            schema = makeExecutableSchema({ typeDefs: mergedDefs, resolvers: resolvers });
            loadingSchema = false;
            //console.log('schema loaded');
            return schema;
        } catch (error) {
            console.error('Error making schema executable');
            if (!error.message) {
                console.error('Check type names in resolvers');
            } else {
                console.error(error.message);
            }
            return Promise.reject(error);
        }
    });
}

async function graphqlHandler(request, env, requestBody) {
    const url = new URL(request.url);
    let query = false;
    let variables = false;

    if (request.method === 'POST') {
        try {
            if (!requestBody) {
                requestBody = await request.json();              
            }
            if (typeof requestBody === 'string') {
                requestBody = JSON.parse(requestBody);
            }
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

    // default headers
    const responseOptions = {
        headers: {
            'content-type': 'application/json;charset=UTF-8',
        }
    };

    const requestId = uuidv4();
    console.info(requestId);
    console.log(new Date().toLocaleString('en-US', { timeZone: 'UTC' }));
    console.log(`KVs pre-loaded: ${dataAPI.kvLoaded.join(', ') || 'none'}`);
    //console.log(query);
    if (request.headers.has('x-newrelic-synthetics')) {
        console.log('NewRelic health check');
        //return new Response(JSON.stringify({}), responseOptions);
    }

    const context = { data: dataAPI, util: graphqlUtil, requestId, lang: {}, warnings: [], errors: [] };
    let result = await graphql({schema: await getSchema(dataAPI, context), source: query, rootValue: {}, contextValue: context, variableValues: variables});
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

    let ttl = dataAPI.getRequestTtl(requestId);

    const body = JSON.stringify(result);

    const response = new Response(body, responseOptions)

    // don't update cache if result contained errors
    if (!skipCache && (!result.errors || result.errors.length === 0) && ttl > 0) {
        response.headers.set('cache-ttl', String(ttl));
    }

    //console.log(`${requestId} kvs loaded: ${dataAPI.requests[requestId].kvLoaded.join(', ')}`);
    delete dataAPI.requests[requestId];
    return response;
}

const graphQLOptions = {
    // Set the path for the GraphQL server
    baseEndpoint: '/graphql',

    // Set the path for the GraphQL playground
    // This option can be removed to disable the playground route
    playgroundEndpoint: '/',

    // When a request's path isn't matched, forward it to the origin
    forwardUnmatchedRequestsToOrigin: false,

    // Enable debug mode to return script errors directly in browser
    debug: true,

    // Enable CORS headers on GraphQL requests
    // Set to `true` for defaults (see `utils/setCors`),
    // or pass an object to configure each header
    //   cors: true,
    cors: {
        allowCredentials: 'true',
        allowHeaders: 'Content-type',
        allowOrigin: '*',
        allowMethods: 'GET, POST',
    },
};

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // convert bytes to hex string
    return [...new Uint8Array(hashBuffer)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
}

export default {
	async fetch(request, env, ctx) {
        if (!['GET', 'POST'].includes(request.method.toUpperCase())) {
            return new Response(null, {
                status: 405,
                headers: { 'cache-control': 'public, max-age=2592000' },
            });
        }
        const requestStart = new Date();
		const url = new URL(request.url);

        const cacheUrl = new URL(request.url);
        let cacheKey = new Request(cacheUrl.toString().toLowerCase(), request);
        const requestBody = await request.text();
        if (request.method.toUpperCase() === 'POST') {
            cacheUrl.pathname = '/posts' + cacheUrl.pathname + await sha256(requestBody);
            cacheKey = new Request(cacheUrl.toString().toLowerCase(), {
                headers: request.headers,
                method: 'GET',
            });
        }
        const cache = env.ENVIRONMENT === 'production' ? caches.default : await caches.open('dev:cache');
        let response = await cache.match(cacheKey);
        if (!skipCache && response) {
            return response;
        }

        try {
            if (url.pathname === '/twitch') {
                response = await twitch(env);
                if (graphQLOptions.cors) {
                    setCors(response, graphQLOptions.cors);
                }
            }

            if (url.pathname === graphQLOptions.playgroundEndpoint) {
                return playground(request, graphQLOptions);
            }

            if (graphQLOptions.forwardUnmatchedRequestsToOrigin) {
                return fetch(request);
            }

            if (!dataAPI) {
                dataAPI = new DataSource(env);
            }
            
            if (url.pathname === '/webhook/nightbot' ||
                url.pathname === '/webhook/stream-elements' ||
                url.pathname === '/webhook/moobot'
            ) {
                response = await nightbot(request, dataAPI);
            }

            if (url.pathname === graphQLOptions.baseEndpoint) {
                response = await graphqlHandler(request, env, requestBody);
                if (graphQLOptions.cors) {
                    setCors(response, graphQLOptions.cors);
                }
            }

            if (!response) {
                response = new Response('Not found', { status: 404 });
            }
            if (!skipCache && response.headers.has('cache-ttl')) {
                const ttl = parseInt(response.headers.get('cache-ttl'));
                response.headers.delete('cache-ttl');
                if (ttl > 0) {
                    response.headers.set('Cache-Control', `s-maxage=${ttl}`);
                    //response.headers.delete('cache-ttl');
                    ctx.waitUntil(cache.put(cacheKey, response.clone()));
                }
            }
            console.log(`Response time: ${new Date() - requestStart} ms`);
			return response;
        } catch (err) {
            return new Response(graphQLOptions.debug ? err : 'Something went wrong', { status: 500 });
        }
	},
};
