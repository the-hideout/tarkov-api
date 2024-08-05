// this module provides a way for the http server to access the cloudflare KVs
// using the same method as in the worker context
import cluster from 'node:cluster';
import { EventEmitter } from 'node:events';

import { v4 as uuidv4} from 'uuid';

const accountId = '424ad63426a1ae47d559873f929eb9fc';

const productionNamespaceId = '2e6feba88a9e4097b6d2209191ed4ae5';
const devNameSpaceID = '17fd725f04984e408d4a70b37c817171';

let emitter;

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
    if (format === 'json') {
        return response.json();
    }
    return response.text();
    
}

async function getDataWorker(kvName, format) {
    if (!emitter) {
        emitter = new EventEmitter()
        process.on('message', (message) => {
            if (!message.id) {
                return;
            }
            if (message.action !== 'kvData') {
                return;
            }
            emitter.emit(message.id, message);
        });
    }
    return new Promise((resolve, reject) => {
        const messageId = uuidv4();
        emitter.once(messageId, (message) => {
            resolve(message.data);
        });
        process.send({action: 'getKv', kvName, id: messageId});
    });
}

const DATA_CACHE = {
    get: async (kvName, format) => {
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

export default function getEnv() {
    return {
        ...process.env,
        DATA_CACHE,
        ctx: {waitUntil: () => {}},
    }
};