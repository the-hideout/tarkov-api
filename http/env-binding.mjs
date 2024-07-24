// this module provides a way for the http server to access the cloudflare KVs
// using the same method as in the worker context
import { MongoClient } from 'mongodb';

const accountId = '424ad63426a1ae47d559873f929eb9fc';

const productionNamespaceId = '2e6feba88a9e4097b6d2209191ed4ae5';
const devNameSpaceId = '17fd725f04984e408d4a70b37c817171';

const cloudflareApiFetch = async (kvName, format) => {
    const namespaceId = process.env.ENVIRONMENT === 'production' ? productionNamespaceId : devNameSpaceId;
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
};

let client;
let database;

const mongoDbFetch = async (kvName, format) => {
    if (!client) {
        client = new MongoClient(process.env.MONGODB_URL);
        await client.connect();
    }
    if (!database) {
        database = client.db(`api${process.env.ENVIRONMENT === 'production' ? '' : '_dev'}`);
    }
    const kvs = database.collection('kv');
    const kv = await kvs.findOne({key: kvName});
    return kv.value;
};

const DATA_CACHE = {
    get: async (kvName, format) => {
        if (process.env.MONGODB_URL) {
            return mongoDbFetch(kvName, format);
        }
        if (process.env.CLOUDFLARE_TOKEN) {
            return cloudflareApiFetch(kvName, format);
        }
        return Promise.reject(new Error('CLOUDFLARE_TOKEN and MONGODB_URL not set'));
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
    }
};