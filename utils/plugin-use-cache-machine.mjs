import cacheMachine from './cache-machine.mjs';
import setCors from './setCors.mjs';

function specialCache(request) {
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.startsWith('application/json')) {
        return 'application/json';
    }
    return undefined;
}

export default function useCacheMachine(env, ctx) {
    return {
        async onParams({params, request, setParams, setResult, fetchAPI}) {
            if (env.SKIP_CACHE === 'true' || env.CLOUDFLARE_TOKEN) {
                console.log(`Skipping cache in ${env.ENVIRONMENT} environment`);
                return;
            }
            const cachedResponse = await cacheMachine.get(env, params.query, params.variables, specialCache(request));
            if (cachedResponse) {
                console.log('Request served from cache');
                setResult(cachedResponse);
            } 
        },
        onContextBuilding({context, extendContext, breakContextBuilding}) {
            context.request.requestId = context.requestId;
            context.request.waitUntil = context.executionContext.waitUntil;
            context.request.data = context.data;
            context.request.warnings = context.warnings;
            context.request.errors = context.errors;
            context.request.params = context.params;
        },
        onResultProcess({request, acceptableMediaTypes, result, setResult, resultProcessor, setResultProcessor}) {
            if (request.cached) {
                return;
            }
            if (!result.data) {
                return;
            }
            if (request.errors?.length > 0) {
                if (!result.errors) {
                    result = Object.assign({errors: []}, result); // this puts the errors at the start of the result
                }
                result.errors.push(...request.errors);
            }
            if (request.warnings?.length > 0) {
                if (!result.warnings) {
                    result = Object.assign({warnings: []}, result);
                }
                result.warnings.push(...request.warnings);
            }

            let ttl = request.data.getRequestTtl(request.requestId);

            const sCache = specialCache(request);
            if (sCache === 'application/json') {
                if (!result.warnings) {
                    result = Object.assign({warnings: []}, result);
                }
                ttl = 30 * 60;
                result.warnings.push({message: `Your request does not have a "content-type" header set to "application/json". Requests missing this header are limited to resposnes that update every ${ttl/60} minutes.`});
            } else if (ttl > 1800) {
                // if the ttl is greater than a half hour, limit it
                ttl = 1800;
            }
            if (env.SKIP_CACHE !== 'true' && ttl > 0 && !env.HTTP_GRAPHQL_SERVER) {
                // using waitUntil doesn't hold up returning a response but keeps the worker alive as long as needed
                ctx.waitUntil(cacheMachine.put(env, request.params.query, request.params.variables, result, String(ttl), sCache));
            }
            delete request.data.requests[request.requestId];
            setResult(result);
            console.log('generated graphql response');
        },
        onResponse({request, response, serverContext, setResponse, fetchAPI}) {
            setCors(response);
        },
    }
}