'use strict';

const _ = require('underscore');
const validate = require('validate.js');
const {errorCodes,sendSocketErr} = require('../../helpers/error.codes');

module.exports.pushAddInputValidator = function (socketWrapper, args, next) {
        let data = args[1];
        let fn = args[2];

        if (validate.isString(data) &&
            data.length>0){
            next();
        }

        let constraints = {
            "payload.data.sys.type": {
                presence: true
            },
            "payload.data.sys.value": {
                presence: true
            },
            // This is so the country doesn't get removed when cleaning the attributes
            "parentId": {}
        };

        validate.async(data, constraints).then(
            (attributes)=>{
                // success
                next ();
            },
            (errors)=>{
                // fail
                sendSocketErr(
                    fn,
                    errorCodes.validation_fail,
                    null,
                    errors
                );
            }
        );
    };

module.exports.pushEditInputValidator = function (socketWrapper, args, next) {
    let data = args[1];
    let fn = args[2];

    let constraints = {
        "payload.data.sys.type": {
            presence: true
        },
        "payload.data.sys.value": {
            presence: true
        }
    };

    validate.async(data, constraints).then(
        (attributes)=>{
            // success
            next ();
        },
        (errors)=>{
            // fail
            sendSocketErr(
                fn,
                errorCodes.validation_fail,
                null,
                errors
            );
        }
    );
};