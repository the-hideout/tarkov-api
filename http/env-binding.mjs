// this module provides a way for the http server to access the cloudflare KVs
// using the same method as in the worker context
const accountId = '424ad63426a1ae47d559873f929eb9fc';

const productionNamespaceId = '2e6feba88a9e4097b6d2209191ed4ae5';
const devNameSpaceID = '17fd725f04984e408d4a70b37c817171';

export default function getEnv() {
    return {
        ...process.env,
        DATA_CACHE: {
            getWithMetadata: async (kvName, format) => {
                const namespaceId = process.env.ENVIRONMENT === 'production' ? productionNamespaceId : devNameSpaceID;
                const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${kvName}`;
                const response = await fetch(url, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${process.env.CLOUDFLARE_TOKEN}`,
                    },
                });
                return {
                    value: await response.text(),
                };
            },
        },
    }
};