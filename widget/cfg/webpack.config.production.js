var webpack = require('webpack');
var path = require('path');
var validate = require('webpack-validator');
var libraryName = 'widget';
var outputFile = libraryName + '.js';
var UglifyJsPlugin = webpack.optimize.UglifyJsPlugin;

var plugins  = [];

//plugins.push(new UglifyJsPlugin({ minimize: true }));
var config = {
  entry: __dirname + '/../src/index.js',
  devtool: 'source-map',
  output: {
    path: __dirname + '/../lib',
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  module: {
    loaders: [
      {
        test: /.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react'],
          plugins: ['babel-plugin-add-module-exports']
        }
      },
      {
        test: /\.css$/,
        loader: 'style-loader!css-loader'
      }
    ]
  },
  externals: {
    'react': {
      'commonjs': 'react',
      'commonjs2': 'react',
      'amd': 'react',
      // React dep should be available as window.React, not window.react
      'root': 'React'
    },
    'react-dom': {
      'commonjs': 'react-dom',
      'commonjs2': 'react-dom',
      'amd': 'react-dom',
      'root': 'ReactDOM'
    }
  },
  resolve: {
    root: path.resolve('./src'),
    extensions: ['', '.js']
  },
  plugins:plugins
};

module.exports = validate(config);
