import * as Sentry from '@sentry/node';

// cache url
const cacheUrl = 'https://cache.tarkov.dev'

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
async function updateCache(env, query, variables, body, ttl = '', specialCache = '') {
    try {
        if (!env.CACHE_BASIC_AUTH) {
            console.warn('env.CACHE_BASIC_AUTH is not set; skipping cache check');
            return false;
        }
        if (cachePaused) {
            console.warn('Cache paused; skipping cache update');
            return false;
        }
        // Get the cacheKey from the request
        query = query.trim();
        const cacheKey = await hash(env.ENVIRONMENT + query + JSON.stringify(variables) + specialCache);
        console.log(`Caching ${body.length} byte response for ${env.ENVIRONMENT} environment${ttl ? ` for ${ttl} seconds` : ''}`);

        // headers and POST body
        const headersPost = {
            body: JSON.stringify({ key: cacheKey, value: body, ttl }),
            method: 'POST',
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'Authorization': `Basic ${env.CACHE_BASIC_AUTH}`,
                'sentry-trace': Sentry.spanToTraceHeader(Sentry.getActiveSpan()),
                'baggage': Sentry.spanToBaggageHeader(Sentry.getActiveSpan()),
            },
            timeout: 10000,
        };

        // Update the cache
        const response = await fetchWithTimeout(`${cacheUrl}/api/cache`, headersPost);

        // Log non-200 responses
        if (response.status !== 200) {
            console.error(`failed to write to cache: ${response.status}`);
            return false
        }
        cacheFailCount = 0;
        return true
    } catch (error) {
        if (error.message === 'The operation was aborted due to timeout') {
            console.warn('Updating cache timed out');
            pauseCache();
            return false;
        }
        console.error('updateCache error: ' + error.message);
        return false;
    }
}

// Checks the caching service to see if a request has been cached
// :param json: the json payload of the incoming worker request
// :return: json results of the item found in the cache or false if not found
async function checkCache(env, query, variables, specialCache = '') {
    try {
        if (!env.CACHE_BASIC_AUTH) {
            console.warn('env.CACHE_BASIC_AUTH is not set; skipping cache check');
            return false;
        }
        if (cachePaused) {
            console.warn('Cache paused; skipping cache check');
            return false;
        }
        query = query.trim();
        const cacheKey = await hash(env.ENVIRONMENT + query + JSON.stringify(variables) + specialCache);
        if (!cacheKey) {
            console.warn('Skipping cache check; key is empty');
            return false;
        }

        const response = await fetchWithTimeout(`${cacheUrl}/api/cache?key=${cacheKey}`, {
            headers: {
                'content-type': 'application/json;charset=UTF-8',
                'Authorization': `Basic ${env.CACHE_BASIC_AUTH}`
            },
        });
        cacheFailCount = 0;
        if (response.status === 200) {
            return await response.json();
        } else if (response.status !== 404) {
            console.error(`failed to read from cache: ${response.status}`);
        }

        return false
    } catch (error) {
        if (error.message === 'The operation was aborted due to timeout') {
            console.warn('Checking cache timed out');
            pauseCache();
            return false;
        }
        console.error('checkCache error: ' + error.message);
        return false;
    }
}

export default {
    get: checkCache,
    put: updateCache
};
