module.exports = {
    Query: {
        status(obj, args, context, info) {
            return context.data.status();
        }
    }
};
