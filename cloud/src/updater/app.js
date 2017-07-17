'use strict';
require("babel-polyfill"); // for es7 async/await runtime
const express = require('express');
const mongoose = require('mongoose');
const CronJob = require('cron').CronJob;
const art = require('ascii-art');
const Table = require('cli-table');
var StatsD = require('node-statsd'),
    analytics = new StatsD('analytics',8125);
const redis = require('redis');
var zmq = require('zmq')
    , sock = zmq.socket('pull');

module.exports = (logger, config) => {

    logger.debug('Hello');

    let db = mongoose.connection;
    db.on('error', console.error);

    let mongoPort = process.env.MONGO_PORT || 27017;
    let mongoUrl = `mongodb://mongo:${mongoPort}/frontero`;

    logger.debug(`Initializing Mongoose (${mongoUrl})`);

    mongoose.connect(mongoUrl, (err) => {
        if(err) {
            logger.error('connection error', err);
        }
    });

    mongoose.config = config;

    sock.connect('tcp://api:3001');
    console.log('Worker connected to port 3001');

    const app = express();
    let server = require('http').createServer(app);
    let io = require('socket.io')(server);

    var redisAdapter = require('socket.io-redis');
    let redisOptions = {
        port: 6379,
        host: 'redis'
    };
    var pub = redis.createClient(redisOptions.port, redisOptions.host, {
        return_buffers: true
    });
    var sub = redis.createClient(redisOptions.port, redisOptions.host, {
        return_buffers: true
    });

    io.adapter(redisAdapter({
        pubClient: pub,
        subClient: sub
    }));

    sock.on('message', function(msg){
        msg = JSON.parse(msg);
        console.log(`handling msg ${msg.command} on room ${msg.roomName}`);
        io.of('/channel').to(msg.roomName).emit(msg.command, msg.data);
    });


    art.font('Fr', 'Doom', 'magenta').font('Updater', 'Doom', 'red', function(rendered){
        console.log(rendered);
    });

}
