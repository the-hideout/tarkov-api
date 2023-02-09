const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { graphql } = require('graphql');
const { v4: uuidv4 } = require('uuid');

const DataSource = require('./datasources');
const dataAPI = new DataSource();
const playground = require('./handlers/playground');
const setCors = require('./utils/setCors');
const typeDefs = require('./schema');
const dynamicTypeDefs = require('./schema_dynamic');
const resolvers = require('./resolvers');
const graphqlUtil = require('./utils/graphql-util');
const cacheMachine = require('./utils/cache-machine');

const nightbot = require('./custom-endpoints/nightbot');
const twitch = require('./custom-endpoints/twitch');

let schema = false;
let loadingSchema = false;
let lastSchemaRefresh = 0;

const schemaRefreshInterval = 1000 * 60 * 10;

// If the environment is not production, skip using the caching service
const skipCache = false; //ENVIRONMENT !== 'production' || false;

// Example of how router can be used in an application
async function getSchema(data, requestId) {
    if (schema && new Date() - lastSchemaRefresh < schemaRefreshInterval) {
        return schema;
    }
    if (loadingSchema) {
        return new Promise((resolve) => {
            let loadingTimedOut = false;
            const loadingTimeout = setTimeout(() => {
                loadingTimedOut = true;
            }, 1000);
            const loadingInterval = setInterval(() => {
                if (loadingTimedOut) {
                    console.log(`Schema loading timed out; forcing load`);
                    clearInterval(loadingInterval);
                    loadingSchema = false;
                    return resolve(getSchema(data, requestId));
                }
                if (loadingSchema === false) {
                    clearTimeout(loadingTimeout);
                    clearInterval(loadingInterval);
                    resolve(schema);
                }
            }, 5);
        });
    }
    loadingSchema = true;
    return dynamicTypeDefs(data, requestId).catch(error => {
        loadingSchema = false;
        console.error('Error loading dynamic type definitions', error);
        return Promise.reject(error);
    }).then(dynamicTypeDefs => {
        let mergedDefs;
        try {
            mergedDefs = mergeTypeDefs([typeDefs, dynamicTypeDefs]);
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

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event));
});

async function graphqlHandler(event, graphQLOptions) {
    const request = event.request;
    const url = new URL(request.url);
    let query = false;
    let variables = false;
    const requestStart = new Date();

    if (request.method === 'POST') {
        try {
            const requestBody = await request.json();
            query = requestBody.query;
            variables = requestBody.variables;
        } catch (jsonError) {
            console.error(jsonError);

            return new Response(null, {
                status: 503,
            });
        }
    } else if (request.method === 'GET') {
        query = url.searchParams.get('query');
        variables = url.searchParams.get('variables');
    } else {
        return new Response(null, {
            status: 501,
            headers: { 'cache-control': 'public, max-age=2592000' }
        });
    }
    // Check for empty /graphql query
    if (!query || query.trim() === "") {
        return new Response('GraphQL requires a query in the body of the request',
            {
                status: 200,
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
        return new Response(JSON.stringify({}), responseOptions);
    }
    let specialCache = '';
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.startsWith('application/json')) {
        specialCache = 'application/json';
    }

    // Check the cache service for data first - If cached data exists, return it
    if (!skipCache) {
        const cachedResponse = await cacheMachine.get(query, variables, specialCache);
        if (cachedResponse) {
            // Construct a new response with the cached data
            const newResponse = new Response(cachedResponse, responseOptions);
            // Add a custom 'X-CACHE: HIT' header so we know the request hit the cache
            newResponse.headers.append('X-CACHE', 'HIT');
            console.log(`Request served from cache: ${new Date() - requestStart} ms`);
            // Return the new cached response
            return newResponse;
        }
    } else {
        //console.log(`Skipping cache in ${ENVIRONMENT} environment`);
    }

    let result = await graphql(await getSchema(dataAPI, requestId), query, {}, { data: dataAPI, util: graphqlUtil, requestId }, variables);

    let ttl = dataAPI.getRequestTtl(requestId);

    if (specialCache === 'application/json') {
        if (!result.errors) {
            result = Object.assign({errors: []}, result);
        }
        ttl = 15 * 60;
        result.errors.push({message: `Your request does not have a "content-type" header set to "application/json". Requests missing this header are limited to resposnes that update every ${ttl/60} minutes.`});
    }

    const body = JSON.stringify(result);

    // Update the cache with the results of the query
    // don't update cache if result contained errors
    if (!skipCache && (specialCache || !result.errors || result.errors.length === 0) && ttl >= 30) {
        // using waitUntil doens't hold up returning a response but keeps the worker alive as long as needed
        event.waitUntil(cacheMachine.put(query, variables, body, String(ttl), specialCache));
    }

    console.log(`Response time: ${new Date() - requestStart} ms`);
    //console.log(`${requestId} kvs loaded: ${dataAPI.requests[requestId].kvLoaded.join(', ')}`);
    delete dataAPI.requests[requestId];
    return new Response(body, responseOptions);
}

const graphQLOptions = {
    // Set the path for the GraphQL server
    baseEndpoint: '/graphql',

    // Set the path for the GraphQL playground
    // This option can be removed to disable the playground route
    playgroundEndpoint: '/___graphql',

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
        allowMethods: 'GET, POST, PUT',
    },

    // Enable KV caching for external REST data source requests
    // Note that you'll need to add a KV namespace called
    // WORKERS_GRAPHQL_CACHE in your wrangler.toml file for this to
    // work! See the project README for more information.
    kvCache: false,
};

const handleRequest = async event => {
    const request = event.request;
    const url = new URL(request.url);

    try {
        if (url.pathname === '/webhook/nightbot') {
            return nightbot(request, dataAPI, event);
        }

        if (url.pathname === '/webhook/stream-elements') {
            return nightbot(request, dataAPI, event);
        }

        if (url.pathname === '/webhook/moobot') {
            return nightbot(request, dataAPI, event);
        }

        if (url.pathname === '/twitch') {
            const response = request.method === 'OPTIONS' ? new Response('', { status: 204 }) : await twitch(request);
            if (graphQLOptions.cors) {
                setCors(response, graphQLOptions.cors);
            }

            return response;
        }

        if (url.pathname === graphQLOptions.baseEndpoint) {
            const response = request.method === 'OPTIONS' ? new Response('', { status: 204 }) : await graphqlHandler(event, graphQLOptions);
            if (graphQLOptions.cors) {
                setCors(response, graphQLOptions.cors);
            }

            return response;
        }

        if (graphQLOptions.playgroundEndpoint && url.pathname === graphQLOptions.playgroundEndpoint) {
            return playground(request, graphQLOptions);
        }

        if (graphQLOptions.forwardUnmatchedRequestsToOrigin) {
            return fetch(request);
        }
        return new Response('Not found', { status: 404 });
    } catch (err) {
        return new Response(graphQLOptions.debug ? err : 'Something went wrong', { status: 500 });
    }
};
