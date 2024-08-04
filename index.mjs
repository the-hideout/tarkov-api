
import getYoga from './graphql-yoga.mjs';
import graphQLOptions from './utils/graphql-options.mjs';

export default {
	async fetch(request, env, ctx) {
        try {
            const yoga = await getYoga(env);
            return yoga.fetch(request, {...env, ctx});
        } catch (err) {
            console.log(err);
            return new Response(graphQLOptions.debug ? err : 'Something went wrong', { status: 500 });
        }
	},
};
