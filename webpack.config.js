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
    output: {
        hashFunction: "xxhash64"
    },
};
  
module.exports = config;
