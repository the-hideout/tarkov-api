// cache url
const cacheUrl = 'https://cache.tarkov.dev'
const headers = {
    'content-type': 'application/json;charset=UTF-8',
    'Authorization': `Basic ${CACHE_BASIC_AUTH}`,
    'Accept-Encoding': 'gzip, deflate, br'
};

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
async function updateCache(query, body) {
    try {
        // Get the cacheKey from the request
        query = query.trim();
        const cacheKey = await hash(query);

        // headers and POST body
        const headersPost = {
            body: JSON.stringify({ key: cacheKey, value: body }),
            method: 'POST',
            headers: headers
        };

        // Update the cache
        const response = await fetch(`${cacheUrl}/api/cache`, headersPost);

        // Log non-200 responses
        if (response.status !== 200) {
            console.log(`failed to write to cache: ${response.status}`);
            return false
        }

        return true
    } catch (error) {
        console.log('updateCache error: ' + error.message);
        return false;
    }
}

// Checks the caching service to see if a request has been cached
// :param json: the json payload of the incoming worker request
// :return: json results of the item found in the cache or false if not found
async function checkCache(query) {
    try {
        query = query.trim();
        const cacheKey = await hash(query);

        // GET headers
        const headersGet = {
            method: 'GET',
            headers: headers
        };

        const response = await fetch(`${cacheUrl}/api/cache?key=${cacheKey}`, headersGet);
        if (response.status === 200) {
            const results = await response.json();

            return results
        }

        return false
    } catch (error) {
        console.log('checkCache error: ' + error.message);
        return false;
    }
}

module.exports = {
    get: checkCache,
    put: updateCache
};
