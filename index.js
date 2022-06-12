//const crypto = require('crypto');
const { EventEmitter } = require('events');

const { makeExecutableSchema } = require('@graphql-tools/schema');
const { mergeTypeDefs } = require('@graphql-tools/merge');
const { graphql } = require('graphql');

const DataSource = require('./datasources');
const dataAPI = new DataSource();
const playground = require('./handlers/playground');
const setCors = require('./utils/setCors');
const typeDefs = require('./schema');
const dynamicTypeDefs = require('./schema_dynamic');
const resolvers = require('./resolvers');
const graphqlUtil = require('./utils/graphql-util');

//require('./loader');

const nightbot = require('./custom-endpoints/nightbot');
const twitch = require('./custom-endpoints/twitch');

// cache url
const cacheUrl = 'https://cache.tarkov.dev'
// default headers
const headers = {
    headers: {
        'content-type': 'application/json;charset=UTF-8',
    }
};

let schema = false;
let loadingSchema = false;
//const schemaEvents = new EventEmitter();
//schemaEvents.setMaxListeners(0);

/**
 * Example of how router can be used in an application
 *  */

// Helper function to create a hash from a string
// :param string: string to hash
// :return: SHA-256 hash of string
async function hash(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('');

    return hashHex;
}

// Updates the cache with the results of a query
// :param json: the incoming request in json
// :param body: the body to cache
// :return: true if successful, false if not
async function updateCache(json, body) {
    try {
        // Get the cacheKey from the request
        const query = json.query.trim();
        const cacheKey = await hash(query);

        // headers and POST body
        const headersPost = {
            body: JSON.stringify({ key: cacheKey, value: body }),
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=UTF-8',
            },
        };

        // Update the cache
        const response = await fetch(`${cacheUrl}/api/cache`, headersPost);

        // Log non-200 responses
        if (response.status !== 200) {
            console.log(`failed to write to cache: ${response.status}`);
            return false
        }

        return true
    } catch (error) {
        console.log('updateCache error: ' + error.message);
        return false;
    }
}

// Checks the caching service to see if a request has been cached
// :param json: the json payload of the incoming worker request
// :return: json results of the item found in the cache or false if not found
async function checkCache(json) {
    try {
        const query = json.query.trim();
        const cacheKey = await hash(query);

        const response = await fetch(`${cacheUrl}/api/cache?key=${cacheKey}`, headers);
        if (response.status === 200) {
            const results = await response.json();
            return results
        }

        return false
    } catch (error) {
        console.log('checkCache error: ' + error.message);
        return false;
    }
}

async function getSchema() {
    if (schema) {
        return schema;
    }
    if (loadingSchema) {
        /*return new Promise((resolve) => {
            schemaEvents.once('loaded', () => {
                resolve(schema);
            });
        });*/
        return new Promise((resolve) => {
            const isDone = () => {
                if (this.loadingSchema === false) {
                    resolve(schema);
                } else {
                    setTimeout(isDone, 5);
                }
            }
            isDone();
        });
    }
    loadingSchema = true;
    return dynamicTypeDefs(dataAPI).then(dynamicTypeDefs => {
        schema = makeExecutableSchema({ typeDefs: mergeTypeDefs([typeDefs, dynamicTypeDefs]), resolvers: resolvers });
        loadingSchema = false;
        //schemaEvents.emit('loaded');
        return schema;
    }).catch(error => {
        loadingSchema = false;
        return Promise.reject(error);
    });
}

addEventListener('fetch', event => {
    event.respondWith(handleRequest(event));
});

async function graphqlHandler(event, graphQLOptions, json) {
    const request = event.request;
    const url = new URL(request.url);
    let query = false;
    let variables = false;

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
    }

    if (request.method === 'GET') {
        query = url.searchParams.get('query');
        variables = url.searchParams.get('variables');
    }

    /* const queryHashString = JSON.stringify({
        query: query,
        variables: variables,
    });

    const queryHash = crypto.createHash('md5').update(queryHashString).digest('hex');

    if(!url.hostname.includes('localhost') && !url.hostname.includes('tutorial.cloudflareworkers.com')){
        const cachedResponse = await QUERY_CACHE.get(queryHash, 'json');

        if(cachedResponse){
            return new Response(JSON.stringify(cachedResponse), {
                headers: {
                    'content-type': 'application/json',
                },
            });
        }
    } */

    await dataAPI.init();
    const result = await graphql(await getSchema(), query, {}, { data: dataAPI, util: graphqlUtil }, variables);
    const body = JSON.stringify(result);

    // Update the cache with the results of the query
    await updateCache(json, body);

    /* if(!result.errors && !url.hostname.includes('localhost') && !url.hostname.includes('tutorial.cloudflareworkers.com')){
        await QUERY_CACHE.put(queryHash, body, {expirationTtl: 300});
    } */

    return new Response(body, {
        headers: {
            'content-type': 'application/json',
        },
    });
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
    const json = await request.clone().json();

    // Check for empty /graphql query
    if (url.pathname === "/graphql" && request.method === 'POST') {
        if (json.query.trim() === "") {
            // Clone the response so that it's no longer immutable
            const response = new Response('GraphQL requires a query in the body of the request', { status: 200 });
            // Add a cache control header
            response.headers.append('cache-control', 'public, max-age=2592000');
            return response;
        }
    }

    // Check the cache service for data first - If cached data exists, return it
    const cachedResponse = await checkCache(json);
    if (cachedResponse) {
        return new Response(cachedResponse, headers);
    }

    try {
        if (url.pathname === '/webhook/nightbot') {
            return nightbot(request, dataAPI);
        }

        if (url.pathname === '/webhook/stream-elements') {
            return nightbot(request, dataAPI);
        }

        if (url.pathname === '/webhook/moobot') {
            return nightbot(request, dataAPI);
        }

        if (url.pathname === '/twitch') {
            const response = request.method === 'OPTIONS' ? new Response('', { status: 204 }) : await twitch(request);
            if (graphQLOptions.cors) {
                setCors(response, graphQLOptions.cors);
            }

            return response;
        }

        if (url.pathname === graphQLOptions.baseEndpoint) {
            const response = request.method === 'OPTIONS' ? new Response('', { status: 204 }) : await graphqlHandler(event, graphQLOptions, json);
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

(async () => {
    initSchema();
    dataAPI.init();
})();
