export default {
    Query: {
        status(obj, args, context, info) {
            return context.data.worker.status.getStatus(context);
        }
    },
};
