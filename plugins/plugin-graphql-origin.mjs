// Pass the request to an origin server if USE_ORIGIN is set to 'true'

export default function useGraphQLOrigin(env) {
    return {
        async onParams({params, request, setParams, setResult, fetchAPI}) {
            if (env.USE_ORIGIN !== 'true') {
                return;
            }
            try {
                const originUrl = new URL(request.url);
                if (env.ORIGIN_OVERRIDE) {
                    originUrl.host = env.ORIGIN_OVERRIDE;
                }
                const queryResult = await fetch(originUrl, {
                    method: request.method,
                    body: JSON.stringify(params),
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    signal: AbortSignal.timeout(20000),
                });
                if (queryResult.status !== 200) {
                    throw new Error(`${queryResult.status} ${queryResult.statusText}: ${await queryResult.text()}`);
                }
                console.log('Request served from origin server');
                request.cached = true;
                if (queryResult.headers.has('X-Cache-Ttl')) {
                    request.resultTtl = queryResult.headers.get('X-Cache-Ttl');
                }
                setResult(await queryResult.json());
            } catch (error) {
                console.error(`Error getting response from origin server: ${error}`);
            }
        },
    }
}