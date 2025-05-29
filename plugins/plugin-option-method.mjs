export default function useOptionMethod() {
    return {
        async onRequest({ request, endResponse, serverContext }) {
            if (request.method.toUpperCase() !== 'OPTIONS') {
                return;
            }
            const optionsResponse = new Response(null, {
                headers: {
                    'cache-control': 'public, max-age=2592000',
                    'Access-Control-Max-Age': '86400',
                },
            });
            //setCors(optionsResponse, graphQLOptions.cors);
            endResponse(optionsResponse);
        },
    }
}
