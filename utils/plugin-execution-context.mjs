export default function useExecutionContext(ctx) {
    return {
        async onRequest({ serverContext }) {
            serverContext.executionContext = ctx;
        },
    }
}
