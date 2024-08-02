export default function useOptionMethod() {
    return {
        async onRequest({ request, endResponse, serverContext }) {
            console.log('plugin-option-method onRequest');
            if (request.method.toUpperCase() !== 'OPTIONS') {
                return;
            }
            const optionsResponse = new Response(null, {
                headers: { 'cache-control': 'public, max-age=2592000' },
            });
            //setCors(optionsResponse, graphQLOptions.cors);
            endResponse(optionsResponse);
        },
    }
}
