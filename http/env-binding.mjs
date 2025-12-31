// this module provides a way for the http server to access the cloudflare KVs
// using the same method as in the worker context
import cluster from 'node:cluster';
import { EventEmitter } from 'node:events';

import { v4 as uuidv4} from 'uuid';

import cacheMachine from '../utils/cache-machine.mjs';
import cloudflareKv from './cloudflare-kv.mjs';

const emitter = new EventEmitter();

if (!cluster.isPrimary) {
    process.on('message', (message) => {
        if (!message.id) {
            return;
        }
        emitter.emit(message.id, message);
    });
}

async function messageParentProcess(message) {
    return new Promise(async (resolve, reject) => {
        const messageId = uuidv4();
        const responseTimeout = setTimeout(() => {
            emitter.off(messageId, messageResponseHandler);
            reject(new Error(`Response from primary process timed out for: ${JSON.stringify(message)}`));
        }, message.timeout ?? 10000);
        const messageResponseHandler = (response) => {
            clearTimeout(responseTimeout);
            if (response.error) {
                return reject(new Error(response.error));
            }
            resolve(response.data);
        }
        emitter.once(messageId, messageResponseHandler);
        process.send({ ...message, id: messageId });
    });
}

async function getDataPrimary(kvName, format) {
    const response = await cloudflareKv.get(kvName);
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
    return messageParentProcess({action: 'getKv', kvName, timeout: 25000});
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

const putCacheWorker = async (env, body, options) => {
    const key = await cacheMachine.createKey(env, options.query, options.variables, options.specialCache);
    messageParentProcess({action: 'cacheResponse', key, body, ttl: options.ttl}).catch(error => {
        console.error(`Error updating cache`, error);
    });
    return;
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