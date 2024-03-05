export default {
    Query: {
        status(obj, args, context, info) {
            return context.data.status();
        }
    }
};
