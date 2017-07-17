'use strict';

const webpack = require('webpack');

module.exports = {
    entry: {
        frontero: "./src/fronteroCore",
        fronteroTeam: "./src/fronteroTeamCore"
    },
    output: {
        Library: 'FronteroCore',
        filename: "dist/[name]Core.js",
        libraryTarget: 'commonjs2'
    },
    module: {
        loaders: [
            {
                test: /.js?$/,
                exclude: /node_modules/,
                loader: 'babel-loader'
            }
        ]
    }
};
