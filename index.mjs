import { createYoga } from 'graphql-yoga'
import { v4 as uuidv4 } from 'uuid';

import DataSource from './datasources/index.mjs';
import schema from './schema.mjs';
import graphqlUtil from './utils/graphql-util.mjs';
import graphQLOptions from './utils/graphql-options.mjs';

import useRequestTimer from './plugins/plugin-request-timer.mjs';
import useHttpServer from './plugins/plugin-http-server.mjs';
import useCacheMachine from './plugins/plugin-use-cache-machine.mjs';
import useTwitch from './plugins/plugin-twitch.mjs';
import useNightbot from './plugins/plugin-nightbot.mjs';
import usePlayground from './plugins/plugin-playground.mjs';
import useOptionMethod from './plugins/plugin-option-method.mjs';

let dataAPI, yoga;

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
            return schema(dataAPI, graphqlUtil.getDefaultContext(dataAPI, context.request.requestId));
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
