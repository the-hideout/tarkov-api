// cache url
const cacheUrl = 'https://cache.tarkov.dev'
const headers = {
    'content-type': 'application/json;charset=UTF-8',
    'Authorization': `Basic ${CACHE_BASIC_AUTH}`
};

let cachePaused = false;

function pauseCache() {
    cachePaused = true;
    setTimeout(() => {
        cachePaused = false;
    }, 60000);
}

async function fetchWithTimeout(resource, options = {}) {
    const { timeout = 1000 } = options;
    
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
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
async function updateCache(query, variables, body, ttl = '') {
    try {
        if (cachePaused) {
            return false;
        }
        // Get the cacheKey from the request
        query = query.trim();
        console.log(`caching response for ${ENVIRONMENT} environment`);
        const cacheKey = await hash(ENVIRONMENT + query + JSON.stringify(variables));

        // headers and POST body
        const headersPost = {
            body: JSON.stringify({ key: cacheKey, value: body, ttl }),
            method: 'POST',
            headers: headers,
            timeout: 10000,
        };

        // Update the cache
        const response = await fetchWithTimeout(`${cacheUrl}/api/cache`, headersPost);

        // Log non-200 responses
        if (response.status !== 200) {
            console.error(`failed to write to cache: ${response.status}`);
            return false
        }

        return true
    } catch (error) {
        if (error.message === 'The operation was aborted') {
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
async function checkCache(query, variables) {
    try {
        if (cachePaused) {
            return false;
        }
        query = query.trim();
        const cacheKey = await hash(ENVIRONMENT + query + JSON.stringify(variables));
        if (!cacheKey) {
            console.warn('Skipping cache check; key is empty');
            return false;
        }

        const response = await fetchWithTimeout(`${cacheUrl}/api/cache?key=${cacheKey}`, { headers: headers });
        if (response.status === 200) {
            return await response.json();
        }

        return false
    } catch (error) {
        if (error.message === 'The operation was aborted') {
            console.warn('Checking cache timed out');
            pauseCache();
            return false;
        }
        console.error('checkCache error: ' + error.message);
        return false;
    }
}

module.exports = {
    get: checkCache,
    put: updateCache
};
