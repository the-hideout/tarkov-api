
function getCfCacheKey(env, key) {
    return new Request(`https://cache.${env.ENVIRONMENT === 'development' ? 'dev-' : ''}api.tarkov.dev/${key}`, {
        method: 'GET',
    });
}

const cfCache = {
    get: async (env, key) => {
        const cfKey = getCfCacheKey(env, key);
        return caches.default.match(cfKey);
    },
    put: async (env, body, options = {}) => {
        const key = options.key;
        if (!key) {
            console.log("Can't update CF cache; no key provided");
            return false;
        }
        const cfKey = getCfCacheKey(env, key);
        const ttl = options.ttl ?? '300';
        const headers = options.headers ?? {};
        headers['Access-Control-Allow-Origin'] = '*';
        headers['Cache-Control'] = `s-maxage=${ttl}`;
        headers['content-type'] ??= 'application/json';
        return caches.default.put(cfKey, new Response(JSON.stringify(body), {
            headers,
        })).then(() => {
            console.log('Response cached to CF');
            return true;
        }).catch(error => {
            console.error(`Error updating CF cache: ${error}`);
            return false;
        });
    },
};

export default cfCache;