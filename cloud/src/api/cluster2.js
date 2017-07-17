'use strict';
require('babel-register');

const config = require('./config/index');
const logger = require('./helpers/logger');
require('sticky-cluster')(

    // server initialization function
    function (callback) {


        let server = require('./app')(logger, config);


        // configure an app
        // do some async stuff if needed

        // don't do server.listen(), just pass the server instance into the callback
        callback(server);
    },

    // options
    {
        port: config.port,
        debug: true
    }
);