/**
 * Created by mosherot on 7/3/16.
 */
'use strict';

const _ = require('underscore');
const validate = require('validate.js');
const {errorCodes, sendHttpErr} = require('../../helpers/error.codes');

module.exports.validateDeveloperTokenReq = function (req, res, next) {

    let constraints = {
        "body.username": {
            presence: true,
            length: {
                minimum: 6,
                message: "username must be at least 6 characters"
            },
            format: {
                pattern: "[\.a-z0-9_-]+",
                flags: "i",
                message: "username can only contain a-z and 0-9 and and . _ and -"
            }
        },
        "body.password": {
            presence: true,
            length: {
                minimum: 8,
                message: "password must be at least 8 characters"
            },
            format: {
                pattern: "[a-z0-9_-]+",
                flags: "i",
                message: "password can only contain a-z and 0-9 and _ and -"
            }
        }
    };

    try {
        validate.async(req, constraints).then(
            (attributes) => {
                // success
                next();
            },
            (errors) => {
                // fail
                sendHttpErr(res, errorCodes.validation_fail, errors);
            }
        );
    }catch (err){
        sendHttpErr(res, errorCodes.validation_fail, err);
    }

};

module.exports.validateChannelTokenReq = function (req, res, next) {
    let constraints = {
        "body.key": {
            presence: true
        },
        "body.secret": {
            presence: true
        },
        "body.channelName": {
            presence: true,
            length: {
                minimum: 6,
                message: "channelName must be at least 6 characters"
            },
            format: {
                pattern: "[\.a-z0-9_-]+",
                flags: "i",
                message: "channelName can only contain a-z and 0-9 and . and _ and -"
            }
        },
        "body.user.username": {
            presence: true,
            length: {
                minimum: 6,
                message: "userName must be at least 6 characters"
            },
            format: {
                pattern: '[\.a-z0-9_-]+',
                flags: "i",
                message: "userName can only contain a-z and 0-9 and . and _ and -"
            }
        },
        "body.user.email": {
            presence: true,
            email: true
        },
        "body.user.pic": {
            presence: false,
            url: true
        }
    };

    try {
        validate.async(req, constraints).then(
            (attributes) => {
                // success
                next();
            },
            (errors) => {
                // fail
                sendHttpErr(res, errorCodes.validation_fail, errors);
            }
        );
    }catch (err){
        sendHttpErr(res, errorCodes.validation_fail, err);
    }

};

module.exports.validateAppTokenReq = function (req, res, next) {
    let constraints = {
        "body.key": {
            presence: true
        },
        "body.secret": {
            presence: true
        },
        "body.user.username": {
            presence: true,
            length: {
                minimum: 6,
                message: "userName must be at least 6 characters"
            },
            format: {
                pattern: '[\.a-z0-9_-]+',
                flags: "i",
                message: "userName can only contain a-z and 0-9 and . and _ and -"
            }
        },
        "body.user.email": {
            presence: true,
            email: true
        },
        "body.user.pic": {
            presence: false,
            url: true
        }
    };

    try {
        validate.async(req, constraints).then(
            (attributes) => {
                // success
                next();
            },
            (errors) => {
                // fail
                sendHttpErr(res, errorCodes.validation_fail, errors);
            }
        );
    }catch (err){
        sendHttpErr(res, errorCodes.validation_fail, err);
    }

};