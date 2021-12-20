const crypto = require('crypto');

const {
    graphql,
    buildSchema,
} = require('graphql');

const playground = require('./handlers/playground');
const setCors = require('./utils/setCors');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');

require('./loader');

const nightbot = require('./custom-endpoints/nightbot');

const schema = buildSchema(typeDefs);

/**
 * Example of how router can be used in an application
 *  */
addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
});

async function graphqlHandler(request, graphQLOptions) {
    const url = new URL(request.url);
    let query = false;
    let variables = false;

    if(request.method === 'POST'){
        try {
            const requestBody = await request.json();
            query = requestBody.query;
            variables = requestBody.variables;
        } catch (jsonError){
            console.error(jsonError);

            return new Response(null, {
                status: 503,
            });
        }
    }

    if(request.method === 'GET'){
        query = url.searchParams.get('query');
        variables = url.searchParams.get('variables');
    }

    const queryHashString = JSON.stringify({
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
    }

    await resolvers.itemInit();

    const result = await graphql(schema, query, resolvers, {}, variables);
    const body = JSON.stringify(result);

    if(!url.hostname.includes('localhost') && !url.hostname.includes('tutorial.cloudflareworkers.com')){
        await QUERY_CACHE.put(queryHash, body, {expirationTtl: 600});
    }

    return new Response(body, {
        headers: {
            'content-type': 'application/json',
        },
    });
};

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

const handleRequest = async request => {
    const url = new URL(request.url);
    try {
        if(url.pathname === '/webhook/nightbot'){
            return nightbot(request);
        }

        if(url.pathname === '/webhook/stream-elements'){
            return nightbot(request);
        }

        if (url.pathname === graphQLOptions.baseEndpoint) {
            const response = request.method === 'OPTIONS' ? new Response('', { status: 204 }) : await graphqlHandler(request, graphQLOptions)
            if (graphQLOptions.cors) {
                setCors(response, graphQLOptions.cors)
            }

            return response;
        }

        if ( graphQLOptions.playgroundEndpoint && url.pathname === graphQLOptions.playgroundEndpoint ) {
            return playground(request, graphQLOptions)
        }

        if (graphQLOptions.forwardUnmatchedRequestsToOrigin) {
            return fetch(request)
        }
        return new Response('Not found', { status: 404 })
    } catch (err) {
        return new Response(graphQLOptions.debug ? err : 'Something went wrong', { status: 500 })
    }
};
