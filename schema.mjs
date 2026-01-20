import { makeExecutableSchema } from '@graphql-tools/schema';

import resolvers from './resolvers/index.mjs';
import schemaStatic from './schema-static.mjs';

export default function getSchema() {
    try {
        return makeExecutableSchema({ typeDefs: schemaStatic, resolvers: resolvers });
    } catch (error) {
        console.error('Error making schema executable');
        if (!error.message) {
            console.error('Check type names in resolvers');
        } else {
            console.error(error.message);
        }
        return Promise.reject(error);
    }
}
