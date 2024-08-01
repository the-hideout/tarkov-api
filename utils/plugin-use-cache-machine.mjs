import cacheMachine from './cache-machine.mjs';

export default function useCacheMachine(requestContext, env, ctx) {
    return {
        async onParams({params, request, setParams, setResult, fetchAPI}) {
            console.log('plugin onParams');
            requestContext.params = params;
            // if an HTTP GraphQL server is configured, pass the request to that
            if (env.HTTP_GRAPHQL_SERVER) {
                try {
                    const serverUrl = `${env.HTTP_GRAPHQL_SERVER}/graphql`;
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
                    return;
                } catch (error) {
                    console.error(`Error getting response from GraphQL server: ${error}`);
                }
            }

            const contentType = request.headers.get('content-type');
            if (!contentType || !contentType.startsWith('application/json')) {
                requestContext.specialCache = 'application/json';
            }

            if (env.SKIP_CACHE !== 'true' && !env.CLOUDFLARE_TOKEN) {
                const cachedResponse = await cacheMachine.get(env, params.query, params.variables, requestContext.specialCache);
                if (cachedResponse) {
                    console.log('Request served from cache');
                    setResult(cachedResponse);
                    return;
                }
            } else {
                console.log(`Skipping cache in ${env.ENVIRONMENT} environment`);
            }
        },
        onParse({ result, replaceParseResult, context, extendContext }) {
            console.log('plugin onParse');
            //requestContext.params = context.params;
        },
        onResultProcess({request, acceptableMediaTypes, result, setResult, resultProcessor, setResultProcessor}) {
            console.log('plugin onResultProcess');

            if (requestContext.errors.length > 0) {
                if (!result.errors) {
                    result = Object.assign({errors: []}, result); // this puts the errors at the start of the result
                }
                result.errors.push(...requestContext.errors);
            }
            if (requestContext.warnings.length > 0) {
                if (!result.warnings) {
                    result = Object.assign({warnings: []}, result);
                }
                result.warnings.push(...requestContext.warnings);
            }

            requestContext.ttl = requestContext.data.getRequestTtl(requestContext.requestId);

            if (requestContext.specialCache === 'application/json') {
                if (!result.warnings) {
                    result = Object.assign({warnings: []}, result);
                }
                requestContext.ttl = 30 * 60;
                result.warnings.push({message: `Your request does not have a "content-type" header set to "application/json". Requests missing this header are limited to resposnes that update every ${ttl/60} minutes.`});
            } else if (requestContext.ttl > 1800) {
                // if the ttl is greater than a half hour, limit it
                requestContext.ttl = 1800;
            }
            if (env.SKIP_CACHE !== 'true' && requestContext.ttl > 0 && !env.HTTP_GRAPHQL_SERVER) {
                // using waitUntil doesn't hold up returning a response but keeps the worker alive as long as needed
                ctx.waitUntil(cacheMachine.put(env, requestContext.params.query, requestContext.params.variables, result, String(requestContext.ttl), requestContext.specialCache));
            }
            delete requestContext.data.requests[requestContext.requestId];
        },
        onResponse({request, response, serverContext, setResponse, fetchAPI}) {
            console.log('plugin onResponse');
            console.log('onResponse', requestContext.ttl, requestContext.requestId);
            console.log('generated graphql response');
        },
    }
}