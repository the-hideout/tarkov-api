import cacheMachine from '../utils/cache-machine.mjs';
import setCors from '../utils/setCors.mjs';

export function getSpecialCache(request) {
    const contentType = request.headers.get('content-type');
    if (request.method === 'POST' && !contentType?.startsWith('application/json')) {
        //return 'application/json'; // don't enforce content type
    }
    return undefined;
}

export default function useCacheMachine(env) {
    return {
        async onParams({params, request, setParams, setResult, fetchAPI}) {
            console.log(request.requestId);
            request.params = params;
            if (env.SKIP_CACHE === 'true' || env.SKIP_CACHE_CHECK === 'true') {
                console.log(`Skipping cache check due to SKIP_CACHE or SKIP_CACHE_CHECK`);
                return;
            }
            if (request.headers.has('cache-check-complete')) {
                console.log(`Skipping cache check already performed by worker`);
                return;
            }
            const cachedResponse = await cacheMachine.get(env, {query: params.query, variables: params.variables, specialCache: getSpecialCache(request)});
            if (cachedResponse) {
                console.log('Request served from cache');
                request.cached = true;
                setResult(JSON.parse(cachedResponse));
            } 
        },
        onValidate({ context, extendContext, params, validateFn, addValidationRule, setValidationFn, setResult }) {
            return ({ valid, result, context, extendContext, setResult }) => {
                // collect stats on if query was valid
                if (valid) {
                    return;
                }
                // result is an array of errors we can log
            };
        },
        onContextBuilding({context, extendContext, breakContextBuilding}) {
            context.request.ctx = context.ctx ?? context.request.ctx;
            if (typeof context.waitUntil === 'function') {
                context.request.ctx.waitUntil = context.waitUntil;
            }
            context.request.data = context.data;
            context.request.warnings = context.warnings;
            context.request.errors = context.errors;
            context.request.params = context.params;
            console.log(`KVs pre-loaded: ${context.data.kvLoaded.join(', ') || 'none'}`);
            extendContext({requestId: context.request.requestId});
        },
        onExecute({ executeFn, setExecuteFn, setResultAndStopExecution, extendContext, args }) {
            const executeStart = new Date();
            //extendContext({executeStart: new Date()});
            return {
                onExecuteDone: ({ args, result, setResult }) => {
                    console.log(args.contextValue.requestId, `Executaion time: ${new Date() - executeStart} ms`);
                    // can check for errors at result.errors
                },
            };
        },
        onResultProcess({request, acceptableMediaTypes, result, setResult, resultProcessor, setResultProcessor}) {
            if (request.cached) {
                return;
            }
            if (!result.data && !result.errors) {
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

            let ttl = request.data?.getRequestTtl(request.requestId) ?? 60 * 5;

            const sCache = getSpecialCache(request);
            if (result.errors?.some(err => err.message === 'Unexpected error.')) {
                ttl = 0;
            } else if (result.errors?.some(err => err.message.startsWith('Syntax Error'))) {
                ttl = 1800;
            } else if (sCache === 'application/json') {
                if (!result.warnings) {
                    result = Object.assign({warnings: []}, result);
                }
                ttl = 30 * 60;
                result.warnings.push({message: `Your request does not have a "content-type" header set to "application/json". Requests missing this header are limited to resposnes that update every ${ttl/60} minutes.`});
            } else if (ttl > 1800) {
                // if the ttl is greater than a half hour, limit it
                ttl = 1800;
            }
            if (env.SKIP_CACHE !== 'true' && ttl > 0 && env.USE_ORIGIN !== 'true') {
                // using waitUntil doesn't hold up returning a response but keeps the worker alive as long as needed
                const cacheBody = JSON.stringify(result);
                if (cacheBody.length > 0) {
                    const cachePut = env.RESPONSE_CACHE.put(env, cacheBody, {query: request.params.query, variables: request.params.variables, ttl, specialCache: sCache});
                    request.ctx.waitUntil(cachePut);
                } else {
                    console.warn('Skipping cache for zero-length response');
                    console.log(`Request method: ${request.method}`);
                    console.log(`Query: ${request.params.query}`);
                    console.log(`Variables: ${JSON.stringify(request.params.variables ?? {}, null, 4)}`);
                }
            }
            console.log(`kvs used in request: ${request.data?.requests[request.requestId]?.kvUsed.join(', ') ?? 'none'}`);
            request.data?.clearRequestData(request.requestId);
            delete request.requestId;
            setResult(result);
            console.log('generated graphql response');
        },
        onResponse({request, response, serverContext, setResponse, fetchAPI}) {
            if (request.data && request.requestId) {
                request.data.clearRequestData(request.requestId);
            }
            setCors(response);
        },
    }
}