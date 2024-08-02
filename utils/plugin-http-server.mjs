import cacheMachine from './cache-machine.mjs';
import graphQLOptions from './graphql-options.mjs';

export default function useHttpServer(env) {
    return {
        async onParams({params, request, setParams, setResult, fetchAPI}) {
            // if an HTTP GraphQL server is configured, pass the request to that
            if (!env.HTTP_GRAPHQL_SERVER) {
                return;
            }
            try {
                const serverUrl = `${env.HTTP_GRAPHQL_SERVER}${graphQLOptions.baseEndpoint}`;
                const queryResult = await fetch(serverUrl, {
                    method: request.method,
                    body: JSON.stringify(params),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                if (queryResult.status !== 200) {
                    throw new Error(`${queryResult.status} ${queryResult.statusText}: ${await queryResult.text()}`);
                }
                console.log('Request served from graphql server');
                setResult(await queryResult.json());
                request.cached = true;
            } catch (error) {
                console.error(`Error getting response from GraphQL server: ${error}`);
            }
        },
    }
}