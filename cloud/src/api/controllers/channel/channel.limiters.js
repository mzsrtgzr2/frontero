'use strict';

const App = require('../../../shared/models/app');
const {errorCodes,sendSocketErr} = require('../../helpers/error.codes');

module.exports.appActionsLimiter= function (socketWrapper, args, next) {
        let socket = socketWrapper.sock;
        let config = socketWrapper.config;
        let appId = socket.decoded_token.appId;
        let fn = args[2];

        if (config.limit.app.enabled==true){
            // lets check its we are allowed to do this operation
            App.findOne({
                _id: appId
            }, (err, app)=> {
                if (err || !app) {
                    sendSocketErr(
                        fn,
                        errorCodes.unexpected_err,
                        err
                    );
                } else {
                    if (app.isAllowedMorePushesToday()) {
                        return next();
                    } else {
                        sendSocketErr(
                            fn,
                            errorCodes.plan_limit,
                            err
                        );
                    }
                }
            });
        } else {
            next();
        }
    };