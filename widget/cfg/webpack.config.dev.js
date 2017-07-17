'use strict';
var path = require('path');
var webpack = require('webpack');
var validate = require('webpack-validator');
var config = {
  entry: ['babel-polyfill','./example/index.js'],
  devtool: 'source-map',
  output: {
    path: path.join(__dirname,'../example'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      { test: /.(jsx|js)?$/, loader: 'babel-loader'},
      { test: /\.css$/,loader: "style-loader!css-loader" },
      { test: /\.jpg$/,loader: "url-loader?limit=10000&minetype=image/jpg" }
    ]
  },
  externals: {
    'moment': 'moment'
  }
};
module.exports = validate(config);
