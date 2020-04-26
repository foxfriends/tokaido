'use strict';
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
module.exports = {
    mode: 'development',
    entry: './public_html/script/src/index.js',
    output: {
        path: path.resolve('./public_html/'),
        filename: 'script/tokaido.js'
    },
    module: {
        rules: [
            { test: /\.scss$/, use: [
                MiniCssExtractPlugin.loader,
                'css-loader',
                'sass-loader',
            ]},
            { test: /\.(otf|ttf)$/, use: 'url-loader' },
            { test: /\.(svg|png|jpe?g)$/, use: 'url-loader?limit=5000&name=/image/[path][name].[ext]&context=public_html/image/src!image-webpack-loader' }
        ]
    },
    plugins: [
        new MiniCssExtractPlugin(),
    ],
};
