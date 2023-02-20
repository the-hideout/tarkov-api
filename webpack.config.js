const crypto = require("crypto");
const crypto_orig_createHash = crypto.createHash;
crypto.createHash = algorithm => crypto_orig_createHash(algorithm == "md4" ? "sha256" : algorithm);

const config = {
    mode: 'production', // "production" | "development" | "none"
    resolve: {
        extensions: ['*', '.mjs', '.js', '.json']
    },
    target: 'webworker',
    entry: './index.js',
    module: {
        rules: [
            {
            test: /\.mjs$/,
            include: /node_modules/,
            type: 'javascript/auto'
            }
        ]
    },
};
  
module.exports = config;
