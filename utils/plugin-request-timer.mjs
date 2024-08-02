export default function useRequestTimer() {
    return {
        onRequest({ request, url, endResponse, serverContext, fetchAPI }) {
            request.startTime = new Date();
        },
        onResponse({request, response, serverContext, setResponse, fetchAPI}) {
            console.log(`Response sent in ${new Date() - request.startTime}ms`);
        },
    }
}
