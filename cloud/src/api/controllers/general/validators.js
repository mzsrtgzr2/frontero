/**
 * Created by mosherot on 7/5/16.
 */
/**
 * Created by mosherot on 7/3/16.
 */
'use strict';

const _ = require('underscore');
const validate = require('validate.js');
const {errorCodes, sendHttpErr} = require('../../helpers/error.codes');

module.exports.validateDeveloperCreate = function (req, res, next) {

    let constraints = {

        "body.username": {
            presence: true,
            length: {
                minimum: 6,
                message: "username must be at least 6 characters"
            },
            format: {
                pattern: "[a-z0-9_-]+",
                flags: "i",
                message: "username can only contain a-z and 0-9 and _ and -"
            }
        },
        "body.email": {
            presence: true,
            email: true
        },
        "body.password": {
            presence: true,
            length: {
                minimum: 6,
                message: "password must be at least 6 characters"
            },
            format: {
                pattern: "[a-z0-9_-]+",
                flags: "i",
                message: "password can only contain a-z and 0-9 and _ and -"
            }
        }
    };

    validate.async(req, constraints).then(
        (attributes) => {
            // success
            next ();
        },
        (errors) => {
            // fail
            sendHttpErr(res, errorCodes.validation_fail, errors);
        }
    );

};