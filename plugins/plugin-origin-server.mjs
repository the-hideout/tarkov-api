// Pass the request to an origin server if USE_ORIGIN is set to 'true'
import graphQLOptions from '../utils/graphql-options.mjs';
import fetchWithTimeout from '../utils/fetch-with-timeout.mjs';
import { useNightbotOnUrl } from './plugin-nightbot.mjs';
import { useLiteApiOnUrl } from './plugin-lite-api.mjs';

export default function useOriginServer(env) {
    return {
        async onRequest({ request, url, endResponse, serverContext, fetchAPI }) {
            if (env.USE_ORIGIN !== 'true') {
                return;
            }
            if (!useNightbotOnUrl(url) && !useLiteApiOnUrl(url)) {
                return;
            }
            try {
                const response = await fetchWithTimeout(request.clone(), {
                    headers: {
                        'cache-check-complete': 'true',
                    },
                    timeout: 20000
                });
                if (response.status !== 200) {
                    throw new Error(`${response.status} ${await response.text()}`);
                }
                console.log('Request served from origin server');
                endResponse(response);
            } catch (error) {
                console.error(`Error getting response from origin server: ${error}`);
            }
        },
        async onParams({params, request, setParams, setResult, fetchAPI}) {
            if (env.USE_ORIGIN !== 'true') {
                return;
            }
            try {
                const serverUrl = `https://api.tarkov.dev${graphQLOptions.baseEndpoint}`;
                //const serverUrl = `http://localhost:8788${graphQLOptions.baseEndpoint}`;
                const queryResult = await fetchWithTimeout(serverUrl, {
                    method: request.method,
                    body: JSON.stringify(params),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    timeout: 20000
                });
                if (queryResult.status !== 200) {
                    throw new Error(`${queryResult.status} ${queryResult.statusText}: ${await queryResult.text()}`);
                }
                console.log('Request served from origin server');
                setResult(await queryResult.json());
                request.cached = true;
            } catch (error) {
                console.error(`Error getting response from origin server: ${error}`);
            }
        },
    }
}