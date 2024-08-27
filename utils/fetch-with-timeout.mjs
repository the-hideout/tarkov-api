function fetchWithTimeout(resource, options = {}) {
    const { timeout = 1000 } = options;
    /*return fetch(resource, {
        ...options,
        signal: AbortSignal.timeout(timeout),
    });*/
    return new Promise((resolve, reject) => {
        const requestTimeout = setTimeout(() => {
            reject(new Error('The operation was aborted due to timeout'));
        }, timeout);
        fetch(resource, options).then(response => {
            resolve(response);
        }).catch(reject).finally(() => {
            clearTimeout(requestTimeout);
        });
    });
}

export default fetchWithTimeout;
