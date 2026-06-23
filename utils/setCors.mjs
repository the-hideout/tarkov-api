import graphQLOptions from "./graphql-options.mjs";

const setCorsHeaders = (response, config) => {
    const corsConfig = config instanceof Object ? config : graphQLOptions.cors;

    try {
        response.headers.set(
            'Access-Control-Allow-Credentials',
            corsConfig?.allowCredentials ?? 'true',
        );
        response.headers.set(
            'Access-Control-Allow-Headers',
            corsConfig?.allowHeaders ?? 'Content-type',
        );
        response.headers.set(
            'Access-Control-Allow-Methods',
            corsConfig?.allowMethods ?? 'OPTIONS, GET, POST',
        );
        response.headers.set('Access-Control-Allow-Origin', corsConfig?.allowOrigin ?? '*');
        response.headers.set('X-Content-Type-Options', 'nosniff');
    } catch (error) {
        console.log('Could not modify immutable headers');
    }
}

export default setCorsHeaders;
