// this module provides a way for the http server to access the cloudflare KVs
// using the same method as in the worker context
import cluster from 'node:cluster';
import { EventEmitter } from 'node:events';

import { v4 as uuidv4} from 'uuid';

import cacheMachine from '../utils/cache-machine.mjs';

const accountId = '424ad63426a1ae47d559873f929eb9fc';

const productionNamespaceId = '2e6feba88a9e4097b6d2209191ed4ae5';
const devNameSpaceID = '17fd725f04984e408d4a70b37c817171';

const emitter = new EventEmitter();

if (!cluster.isPrimary) {
    process.on('message', (message) => {
        if (!message.id) {
            return;
        }
        emitter.emit(message.id, message);
    });
}

async function getDataPrimary(kvName, format) {
    const namespaceId = process.env.ENVIRONMENT === 'production' ? productionNamespaceId : devNameSpaceID;
    const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${kvName}`;
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
        },
    });
    if (response.status === 404) {
        return null;
    }
    if (response.status === 400) {
        return Promise.reject(new Error('Invalid CLOUDFLARE_TOKEN'));
    }
    if (response.status !== 200) {
        return Promise.reject(new Error(`${response.statusText} ${response.status}`));
    }
    if (format === 'json') {
        return response.json();
    }
    return response.text();   
}

async function getDataWorker(kvName, format) {
    return new Promise((resolve, reject) => {
        const messageId = uuidv4();
        emitter.once(messageId, (message) => {
            if (message.error) {
                return reject(new Error(message.error));
            }
            resolve(message.data);
        });
        process.send({action: 'getKv', kvName, id: messageId});
    });
}

const DATA_CACHE = {
    get: (kvName, format) => {
        if (cluster.isPrimary) {
            return getDataPrimary(kvName, format);
        }
        return getDataWorker(kvName, format);
    },
    getWithMetadata: async (kvName, format) => {
        return {
            value: await DATA_CACHE.get(kvName, format),
        };
    },
};

const putCacheWorker = (env, body, options) => {
    return new Promise(async (resolve, reject) => {
        const messageId = uuidv4();
        emitter.once(messageId, (message) => {
            if (message.error) {
                return reject(new Error(message.error));
            }
            resolve(message.data);
        });
        const key = await cacheMachine.createKey(env, options.query, options.variables, options.specialCache);
        process.send({action: 'cacheResponse', key, body, ttl: options.ttl, id: messageId});
    });
};

const RESPONSE_CACHE = {
    get: cacheMachine.get,
    put: (env, body, options) => {
        if (cluster.isPrimary) {
            return cacheMachine.put(env, body, options);
        }
        return putCacheWorker(env, body, options);
    },
};

export default function getEnv() {
    return {
        ...process.env,
        DATA_CACHE,
        RESPONSE_CACHE,
        //ctx: {waitUntil: () => {}},
    }
};