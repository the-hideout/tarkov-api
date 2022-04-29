const { mergeResolvers } = require('@graphql-tools/merge');

module.exports = mergeResolvers([
    require('./ammoResolver'),
    require('./barterResolver'),
    require('./craftResolver'),
    require('./hideoutResolver'),
    require('./itemResolver'),
    require('./statusResolver'),
    require('./taskResolver'),
    require('./traderResolver'),
    require('./mapResolver'),
]);
