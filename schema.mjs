import { makeExecutableSchema } from '@graphql-tools/schema';
import { mergeTypeDefs } from '@graphql-tools/merge';

import resolvers from './resolvers/index.mjs';
import schemaStatic from './schema-static.mjs';
import schemaDynamic from './schema-dynamic.mjs';

let schema, loadingSchema;
let lastSchemaRefresh = 0;

const schemaRefreshInterval = 1000 * 60 * 10;

export default async function getSchema(data, context) {
    if (schema && new Date() - lastSchemaRefresh < schemaRefreshInterval) {
        return schema;
    }
    if (loadingSchema) {
        return new Promise((resolve) => {
            let loadingTimedOut = false;
            const loadingTimeout = setTimeout(() => {
                loadingTimedOut = true;
            }, 3100);
            loadingTimeout.unref();
            const loadingInterval = setInterval(() => {
                if (loadingSchema === false) {
                    clearTimeout(loadingTimeout);
                    clearInterval(loadingInterval);
                    return resolve(schema);
                }
                if (loadingTimedOut) {
                    console.log(`Schema loading timed out; forcing load`);
                    clearInterval(loadingInterval);
                    loadingSchema = false;
                    return resolve(getSchema(data, context));
                }
            }, 100);
            loadingInterval.unref();
        });
    }
    loadingSchema = true;
    return schemaDynamic(data, context).catch(error => {
        loadingSchema = false;
        console.error('Error loading dynamic type definitions', error);
        return Promise.reject(error);
    }).then(dynamicDefs => {
        let mergedDefs;
        try {
            mergedDefs = mergeTypeDefs([schemaStatic, dynamicDefs]);
        } catch (error) {
            console.error('Error merging type defs', error);
            return Promise.reject(error);
        }
        try {
            schema = makeExecutableSchema({ typeDefs: mergedDefs, resolvers: resolvers });
            loadingSchema = false;
            //console.log('schema loaded');
            lastSchemaRefresh = new Date();
            return schema;
        } catch (error) {
            console.error('Error making schema executable');
            if (!error.message) {
                console.error('Check type names in resolvers');
            } else {
                console.error(error.message);
            }
            return Promise.reject(error);
        }
    });
}
