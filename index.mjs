import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { createYoga } from 'graphql-yoga'
import { v4 as uuidv4 } from 'uuid';

import DataSource from './datasources/index.mjs';
import typeDefs from './schema.mjs';
import dynamicTypeDefs from './schema_dynamic.mjs';
import resolvers from './resolvers/index.mjs';
import graphqlUtil from './utils/graphql-util.mjs';
import graphQLOptions from './utils/graphql-options.mjs';

import useRequestTimer from './utils/plugin-request-timer.mjs';
import useHttpServer from './utils/plugin-http-server.mjs';
import useCacheMachine from './utils/plugin-use-cache-machine.mjs';
import useTwitch from './utils/plugin-twitch.mjs';
import useNightbot from './utils/plugin-nightbot.mjs';
import usePlayground from './utils/plugin-playground.mjs';
import useOptionMethod from './utils/plugin-option-method.mjs';

let dataAPI;
let schema, loadingSchema, yoga;
let lastSchemaRefresh = 0;

const schemaRefreshInterval = 1000 * 60 * 10;

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
            loadingTimeout.unref();
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
            loadingInterval.unref();
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
            lastSchemaRefresh = new Date();
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

export async function getYoga(env) {
    if (!dataAPI) {
        dataAPI = new DataSource(env);
    }
    return createYoga({
        schema: (context) => {
            // this context only has the env vars present on creation
            context.request.requestId = uuidv4();
            if (env.ctx) {
                context.request.ctx = env.ctx;
            }
            if (context.ctx) {
                context.request.ctx = context.ctx;
            }
            return getSchema(dataAPI, graphqlUtil.getDefaultContext(dataAPI, context.request.requestId));
        },
        context: async ({request, params}) => {
            return graphqlUtil.getDefaultContext(dataAPI, request.requestId);
        },
        plugins: [
            useRequestTimer(),
            useOptionMethod(),
            useTwitch(),
            usePlayground(),
            useNightbot(),
            useHttpServer(env),
            useCacheMachine(env),
        ],
        cors: {
            origin: '*',
            credentials: true,
            allowedHeaders: ['Content-Type'],
            methods: graphQLOptions.cors.allowMethods.split(', '),
        },
    });
}

export default {
	async fetch(request, env, ctx) {
        try {
            if (!yoga) {
                yoga = await getYoga(env);
            }
            return yoga.fetch(request, {...env, ctx});
        } catch (err) {
            console.log(err);
            return new Response(graphQLOptions.debug ? err : 'Something went wrong', { status: 500 });
        }
	},
};
