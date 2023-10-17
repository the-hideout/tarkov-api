import { trace } from '@opentelemetry/api'
import envHandler from '../environment_handler';
// cache url
const cacheUrl = 'https://cache.tarkov.dev'

function getHeaders() {
    return {
        'content-type': 'application/json;charset=UTF-8',
        'Authorization': `Basic ${envHandler.getEnv().CACHE_BASIC_AUTH}`
    }
}

let cacheFailCount = 0;
let cachePaused = false;

function pauseCache() {
    cacheFailCount++;
    if (cacheFailCount <= 2) {
        return;
    }
    cachePaused = true;
    setTimeout(() => {
        cachePaused = false;
        cacheFailCount = 0;
    }, 60000);
}

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 1000 } = options;
    return fetch(resource, {
        ...options,
        signal: AbortSignal.timeout(timeout),
    });
}

// Helper function to create a hash from a string
// :param string: string to hash
// :return: SHA-256 hash of string
async function hash(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
        .map((bytes) => bytes.toString(16).padStart(2, '0'))
        .join('');

    return hashHex;
}

// Updates the cache with the results of a query
// :param json: the incoming request in json
// :param body: the body to cache
// :return: true if successful, false if not
async function updateCache(query, variables, body, ttl = '', specialCache = '') {
    const tracer = trace.getTracer('cache');
    return tracer.startActiveSpan('updateCache', async (span) => {
        let result = false;
        attemptUpdate: try {
            if (cachePaused) {
                console.warn('Cache paused; skipping cache update');
                result = false;
                break attemptUpdate;
            }
            // Get the cacheKey from the request
            query = query.trim();
            console.log(`caching response for ${envHandler.getEnv().ENVIRONMENT} environment`);
            const cacheKey = await hash(envHandler.getEnv().ENVIRONMENT + query + JSON.stringify(variables) + specialCache);
            span.setAttribute('cacheKey', cacheKey);
            // headers and POST body
            const headersPost = {
                body: JSON.stringify({ key: cacheKey, value: body, ttl }),
                method: 'POST',
                headers: getHeaders(),
                timeout: 10000,
            };

            // Update the cache
            const response = await fetchWithTimeout(`${cacheUrl}/api/cache`, headersPost);

            // Log non-200 responses
            if (response.status !== 200) {
                console.error(`failed to write to cache: ${response.status}`);
                result = false;
                break attemptUpdate;
            }
            cacheFailCount = 0;
            result = true;
        } catch (error) {
            if (error.message === 'The operation was aborted due to timeout') {
                console.warn('Updating cache timed out');
                pauseCache();
                result = false;
                break attemptUpdate;
            }
            console.error('updateCache error: ' + error.message);
            result = false;
        } finally {
            span.end();
        }
        return result;
    });
}

// Checks the caching service to see if a request has been cached
// :param json: the json payload of the incoming worker request
// :return: json results of the item found in the cache or false if not found
async function checkCache(query, variables, specialCache = '') {
    const tracer = trace.getTracer('cache');
    return tracer.startActiveSpan('checkCache', async (span) => {
        let result = false;
        attemptCheck: try {
            if (cachePaused) {
                console.warn('Cache paused; skipping cache check');
                result = false;
                break attemptCheck;
            }
            query = query.trim();
            const cacheKey = await hash(envHandler.getEnv().ENVIRONMENT + query + JSON.stringify(variables) + specialCache);
            span.setAttribute('cacheKey', cacheKey);
            if (!cacheKey) {
                console.warn('Skipping cache check; key is empty');
                result = false;
                break attemptCheck;
            }

            const response = await fetchWithTimeout(`${cacheUrl}/api/cache?key=${cacheKey}`, { headers: getHeaders() });
            cacheFailCount = 0;
            if (response.status === 200) {
                result = await response.json();
                break attemptCheck;
            }

            return false
        } catch (error) {
            if (error.message === 'The operation was aborted due to timeout') {
                console.warn('Checking cache timed out');
                pauseCache();
                result = false;
                break attemptCheck;
            }
            console.error('checkCache error: ' + error.message);
            result = false;
            break attemptCheck;
        } finally {
            span.end();
        }
        return result;
    });
}

module.exports = {
    get: checkCache,
    put: updateCache
};
