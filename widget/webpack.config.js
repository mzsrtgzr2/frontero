'use strict';
const path = require('path');
var env = process.env.NODE_ENV;
var config;

config = require(path.join(__dirname, 'cfg/webpack.config.'+ env));

module.exports = config;
