'use strict';
require('babel-register');
var cluster = require('cluster');
var sticky = require('sticky-session');
var numCPUs = require('os').cpus().length;


const config = require('./config/index');
const logger = require('./helpers/logger');

let server = require('./app')(logger, config);



if (cluster.isMaster) {
    console.log(`detected ${numCPUs} CPUs`);

    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', function(worker, code, signal) {
        console.log('worker ' + worker.process.pid + ' died');
    });


} else {

    server.listen(config.port);

}