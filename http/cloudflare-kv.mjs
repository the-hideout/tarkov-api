import { EventEmitter } from 'node:events';

import fetchWithTimeout from '../utils/fetch-with-timeout.mjs';

const completeEmitter = new EventEmitter();

const accountId = '424ad63426a1ae47d559873f929eb9fc';

const productionNamespaceId = '2e6feba88a9e4097b6d2209191ed4ae5';
const devNameSpaceID = '17fd725f04984e408d4a70b37c817171';

const requestLimit = 6;

let pending = [];
const queue = [];

const checkQueue = async () => {
    if (pending.length >= requestLimit) {
        return;
    }
    if (queue.length < 1) {
        return;
    }
    const kvName = queue.shift();
    pending.push(kvName);

    const namespaceId = process.env.ENVIRONMENT === 'production' ? productionNamespaceId : devNameSpaceID;
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${kvName}`;
    let response;
    try {
        response = await fetchWithTimeout(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
            },
            timeout: 9000,
        });
        completeEmitter.emit(kvName, response);
    } catch (error) {
        //response = new Response(null, {status: 500, statusText: error.message});
        queue.unshift(kvName);
    } finally {
        pending = pending.filter(kv => kv !== kvName);
    }
    checkQueue();
};

const cloudflareKv = {
    get: async (kvName) => {
        return new Promise((resolve) => {
            completeEmitter.once(kvName, resolve);
            if (!pending.includes(kvName) && !queue.includes(kvName)) {
                queue.push(kvName);
            }
            checkQueue();
        });
    },
};

export default cloudflareKv;
