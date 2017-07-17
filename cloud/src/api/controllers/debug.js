'use strict';

const Developer = require('../../shared/models/developer');
const App = require('../../shared/models/app');
const Channel = require('../../shared/models/channel');
const User = require('../../shared/models/user');
const Push = require('../../shared/models/push');
const archive = require('../helpers/archive').archive;
const redis = require('redis');

module.exports.controller = router => {
    router
        .get('/debug/empty_db', (req, res, next) => {
            Push.remove({}).exec()
                .then(function () {
                    Channel.remove({}).exec()
                        .then(function () {
                            App.remove({}).exec()
                                .then(function () {
                                    Developer.remove({}).exec()
                                        .then(function () {
                                            User.remove({}).exec()
                                                .then(function () {
                                                    res.send(false/*no error*/);
                                                });
                                        });
                                });
                        });
                });
        })
        .get('/debug/empty_cache', (req, res, next) => {
            let client = redis.createClient('6379', 'redis');
            client.flushdb( function (err, succeeded) {
                res.send(false/*no error*/);
            });
        })
        .get('/debug/archive', (req, res, next) => {
            archive(req.logger, req.config, ()=>{
                res.send(false/*no error*/);
            });
        })
        .get('/debug/set_bruteforce/:value', (req, res, next) => {
            req.config.limit.bruteforce.enabled = (req.params.value=='true');
            //console.log(`set_bruteforce=${req.config.limit.bruteforce.enabled}`);
            res.send(false/*no error*/);
            
        })
        .get('/debug/set_app_limits/:value', (req, res, next) => {
            req.config.limit.app.enabled = (req.params.value=='true');
            //console.log(`set_bruteforce=${req.config.limit.app.enabled}`);
            res.send(false/*no error*/);

        });
};