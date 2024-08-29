function fetchWithTimeout(resource, options = {}) {
    const { timeout = 1000 } = options;
    /*return fetch(resource, {
        ...options,
        signal: AbortSignal.timeout(timeout),
    });*/
    return new Promise((resolve, reject) => {
        const controller = new AbortController();
        const requestTimeout = setTimeout(() => {
            controller.abort();
            reject(new Error('The operation was aborted due to timeout'));
        }, timeout);
        fetch(resource, { ...options, signal: controller.signal }).then(response => {
            resolve(response);
        }).catch(reject).finally(() => {
            clearTimeout(requestTimeout);
        });
    });
}

export default fetchWithTimeout;
