import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { createYoga } from 'graphql-yoga'

import DataSource from './datasources/index.mjs';
//import playground from './handlers/playground.mjs';
import graphiql from './handlers/graphiql.mjs';
import setCors from './utils/setCors.mjs';
import typeDefs from './schema.mjs';
import dynamicTypeDefs from './schema_dynamic.mjs';
import resolvers from './resolvers/index.mjs';
import graphqlUtil from './utils/graphql-util.mjs';
import useCacheMachine from './utils/plugin-use-cache-machine.mjs';

import nightbot from './custom-endpoints/nightbot.mjs';
import twitch from './custom-endpoints/twitch.mjs';

let dataAPI;
let schema, loadingSchema;
let lastSchemaRefresh = 0;

const schemaRefreshInterval = 1000 * 60 * 10;

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

async function graphqlHandler(request, env, ctx) {
    const context = graphqlUtil.getDefaultContext(dataAPI);
    const yoga = createYoga({
        schema: await getSchema(dataAPI, context),
        context,
        plugins: [useCacheMachine(context, env, ctx)],
        cors: {
            origin: '*',
            credentials: true,
            allowedHeaders: ['Content-Type'],
            methods: ['GET', 'POST'],
        },
    });
    return yoga.fetch(request);
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
        allowMethods: 'OPTIONS, GET, POST',
    },
};

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
                headers: { 'cache-control': 'public, max-age=2592000' },
            });
            setCors(optionsResponse, graphQLOptions.cors);
            return optionsResponse;
        }
        const requestStart = new Date();
		const url = new URL(request.url);

        let response;

        try {
            if (url.pathname === '/twitch') {
                response = await twitch(env);
                if (graphQLOptions.cors) {
                    setCors(response, graphQLOptions.cors);
                }
            }

            if (url.pathname === graphQLOptions.playgroundEndpoint) {
                //response = playground(request, graphQLOptions);
                response = graphiql(request, graphQLOptions);
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
                response = await graphqlHandler(request, env, ctx);
                if (graphQLOptions.cors) {
                    setCors(response, graphQLOptions.cors);
                }
            }

            if (!response) {
                response = new Response('Not found', { status: 404 });
            }
            console.log(`Response time: ${new Date() - requestStart} ms`);
			return response;
        } catch (err) {
            console.log(err);
            return new Response(graphQLOptions.debug ? err : 'Something went wrong', { status: 500 });
        }
	},
};
