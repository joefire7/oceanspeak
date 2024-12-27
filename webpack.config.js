const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
    entry: './src/main.ts',
    output: {
        filename: '[name].bundle.js',
        path: path.resolve(__dirname, 'dist'),
        chunkFilename: '[name].chunk.js',
    },
    mode: 'development',
    devtool: 'inline-source-map',
    devServer: {
        static: path.join(__dirname, 'dist'),
        compress: true,
        port: 4000,
        open: true,
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js'],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: './dist/index.html', // Correct path to your HTML file
        }),
    ],
};
