const path = require('path');

module.exports = {
    entry: './src/HitBox-Utils.ts',
    output: {
        filename: 'hitbox-utils.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    }
};