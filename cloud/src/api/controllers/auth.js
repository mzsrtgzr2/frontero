'use strict';

const Developer = require('../../shared/models/developer');
const App = require('../../shared/models/app');
const Channel = require('../../shared/models/channel');
const User = require('../../shared/models/user');
const jwt = require("jwt-simple");
const {errorCodes, sendHttpErr} = require('../helpers/error.codes');
const {validateDeveloperTokenReq, validateAppTokenReq, validateChannelTokenReq} = require('./auth/auth.validators.js');
const mongoose = require('mongoose');

module.exports.controller = (router, bfPolicies) => {
    router
        .post('/token-developer',
            bfPolicies.tokenDeveloper, // bruteforce protection
            validateDeveloperTokenReq, // make sure all inputs are ok
            (req, res, next) => { // if ok, handle actual request
                Developer.findOne({
                    username: req.body.username
                }).select('+password')
                    .exec((err, developer) => {
                        if (err || !developer) {
                            sendHttpErr(res, errorCodes.unauthorized);
                        } else {
                            // validate password
                            if (developer.validPassword(req.body.password)){
                                var payload = {
                                    _id: developer._id,
                                    username: developer.username,
                                    expiresInMinutes: req.config.jwtTokenTimeout
                                };
                                var token = jwt.encode(payload, req.config.developerAuth.secret);
                                res.send({
                                    token: token,
                                    developer: developer
                                });
                            } else {
                                sendHttpErr(res, errorCodes.unauthorized);
                            }
                        }
                    });
        })
        .post('/token-app',
            bfPolicies.tokenApp, // bruteforce protection
            validateAppTokenReq,  // make sure all inputs are ok
            function (req, res, next) { // if ok, handle actual request
                // sanity

                if (!(req.body.user &&
                    req.body.key &&
                    req.body.secret)){
                    // wtf, that's not good input
                    return sendHttpErr(res, errorCodes.unauthorized);
                }

                let enabledBruteforce = req.config.limit.bruteforce.enabled;

                App.findOne({
                    key: req.body.key
                }).exec(async function (err, app) {
                    if (err || !app) {
                        return sendHttpErr(res, errorCodes.unauthorized);
                    }
                    // validate password
                    if (app.validSecret(req.body.secret)){

                        // bruteforce protection
                        // we want to protect the number of NEW users per IP
                        // we have two functions for that: check and incr
                        // we use the result of `check` to allow a new user
                        // to be created
                        // on the callback, we update the limiter if one was
                        // actually inserted so an attack will not take place.

                        let isAllowedNewUser = await bfPolicies.users.creations.check(req.connection.remoteAddress);

                        if (!enabledBruteforce){ // if bf not enabled we always allow new users
                            isAllowedNewUser = true;
                        }

                        // verify the user exists, and create one if needed
                        User.upsert({
                                // query
                                email: req.body.user.email,
                                appId: app._id
                            },
                            {
                                //data to insert
                                username: req.body.user.username,
                                email: req.body.user.email,
                                pic: req.body.user.pic,
                                extra: req.body.user.extra,
                                appId: app._id
                            },
                            isAllowedNewUser,
                            async function (err, isNew, u) {
                                if (err) {
                                    if (isAllowedNewUser==false){ // we are limited!
                                        return sendHttpErr(res, errorCodes.bruteforce);
                                    } else {
                                        // cant find and cant insert new user - wierd...
                                        return sendHttpErr(res, errorCodes.unexpected_err);
                                    }
                                } else {


                                    let payload = {
                                        appId: app._id,
                                        appName: app.name,
                                        expiresInMinutes: req.config.jwtTokenTimeout,
                                        userId: u._id,
                                        moshe: "rot"
                                    };

                                    let token = jwt.encode(payload, req.config.appAuth.secret);

                                    res.send({
                                        token: token,
                                        app: app
                                    });
                                }
                            });

                    } else {
                        return sendHttpErr(res, errorCodes.unauthorized);
                    }


                });
            })
        .post('/token-channel',
            bfPolicies.tokenApp, // bruteforce protection
            validateChannelTokenReq,  // make sure all inputs are ok
            function (req, res, next) { // if ok, handle actual request
                // sanity
                if (!(req.body.user &&
                    req.body.channelName &&
                    req.body.key &&
                    req.body.secret)){
                    // wtf, that's not good input
                    return sendHttpErr(res, errorCodes.unauthorized);
                }

                let enabledBruteforce = req.config.limit.bruteforce.enabled;

                App.findOne({
                    key: req.body.key
                }).exec(async function (err, app) {
                        if (err || !app) {
                            return sendHttpErr(res, errorCodes.unauthorized, err);
                        }
                        // validate password
                        if (app.validSecret(req.body.secret)){

                            // bruteforce protection
                            // we want to protect the number of NEW users per IP
                            // we have two functions for that: check and incr
                            // we use the result of `check` to allow a new user
                            // to be created
                            // on the callback, we update the limiter if one was
                            // actually inserted so an attack will not take place.

                            let isAllowedNewUser = await bfPolicies.users.creations.check(req.connection.remoteAddress);

                            if (!enabledBruteforce){ // if bf not enabled we always allow new users
                                isAllowedNewUser = true;
                            }

                            // verify the user exists, and create one if needed
                            User.upsert({
                                    // query
                                    email: req.body.user.email,
                                    appId: app._id
                                },
                                {
                                    //data to insert
                                    username: req.body.user.username,
                                    email: req.body.user.email,
                                    pic: req.body.user.pic,
                                    extra: req.body.user.extra,
                                    appId: app._id
                                },
                                isAllowedNewUser,
                                async function (err, isNew, u) {
                                    if (err) {
                                        if (isAllowedNewUser==false){ // we are limited!
                                            return sendHttpErr(res, errorCodes.bruteforce);
                                        } else {
                                            // cant find and cant insert new user - wierd...
                                            return sendHttpErr(res, errorCodes.unexpected_err);
                                        }
                                    } else {
                                        if (isNew==true){
                                            // user was inserted!
                                            let willBeAllowedNextTime = await bfPolicies.users.creations.incr(req.connection.remoteAddress);
                                        } else {
                                            // user was updated!
                                        }

                                        let _afterChannelVerifiedCb = (channelId) => {
                                            let payload = {
                                                appId: app._id,
                                                appName: app.name,
                                                channelName: req.body.channelName,
                                                channelId: channelId,
                                                expiresInMinutes: req.config.jwtTokenTimeout,
                                                userId: u._id
                                            };

                                            let token = jwt.encode(payload, req.config.channelAuth.secret);
                                            
                                            res.send({
                                                token: token,
                                                app: app,
                                                userId: u._id
                                            });
                                        };

                                        // this is the same mechanism for brute-force protection
                                        // as above with user
                                        // ^^^ go several lines up and read ^^^

                                        let isAllowedNewChannel = await bfPolicies.channel.creations.check(req.connection.remoteAddress);

                                        if (!enabledBruteforce){ // if bf not enabled we always allow new channels
                                            isAllowedNewChannel = true;
                                        }

                                        // verify the channel exists, and create one if needed
                                        Channel.upsert({
                                                // query
                                                name: req.body.channelName,
                                                appId: app._id
                                            },
                                            {
                                                //data to insert
                                                name: req.body.channelName,
                                                appId: app._id
                                            },
                                            isAllowedNewChannel,
                                            async function (err, isNew, ch) {
                                                if (err) {
                                                    // cant find and cant insert new channel
                                                    if (isAllowedNewChannel==false){ // we are limited!
                                                        return sendHttpErr(res, errorCodes.bruteforce);
                                                    } else {
                                                        // cant find and cant insert new channel - wierd...
                                                        return sendHttpErr(res, errorCodes.unexpected_err);
                                                    }
                                                } else {
                                                    if (isNew){
                                                        // user was inserted!
                                                        await bfPolicies.channel.creations.incr(req.connection.remoteAddress);
                                                    } else {
                                                        // user was updated!
                                                    }
                                                    _afterChannelVerifiedCb(ch._id);
                                                }
                                            });
                                    }
                                });

                        } else {
                            return sendHttpErr(res, errorCodes.unauthorized);
                        }


                    });
        })
};
