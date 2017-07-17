/**
 * Created by mosherot on 7/2/16.
 */

const format = require('format-error').format;
const _ = require('underscore');
const HttpStatus = require('http-status-codes'); // https://www.npmjs.com/package/http-status-codes

export const errorCodes = {
    validation_fail: {
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        msg: 'input data is invalid.',
        domain: 'validation',
        severity: 'high'
    },
    resource_not_found: {
        status: HttpStatus.NOT_FOUND,
        msg: 'resource not found in our system',
        domain: 'db',
        severity: 'high'
    },
    unauthorized: {
        status: HttpStatus.UNAUTHORIZED,
        msg: 'unauthorized',
        domain: 'system',
        severity: 'high'
    },
    unexpected_err: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        msg: 'unexpected error',
        domain: 'system',
        severity: 'high'
    },
    unknown: {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        msg: 'internal server error',
        domain: 'system',
        severity: 'high'
    },
    plan_limit: {
        status: HttpStatus.TOO_MANY_REQUESTS,
        msg: 'Your plan limits dont allow any more requests',
        domain: 'system',
        severity: 'high'
    },
    bruteforce: {
        status: HttpStatus.TOO_MANY_REQUESTS,
        msg: 'Too many requests',
        domain: 'system',
        severity: 'high'
    }
};


export function sendHttpErr (res, errorTag, nativeErrorObj=null, params=null) {
    let errorObj;
    try {
        if (_.isObject(errorTag)) {
            errorObj = errorTag;
        } else if(_.isString(errorTag)) {
            errorObj = errorCodes[errorTag];
        } else {
            throw new Error('bad error format');
        }

        let error = new Error(errorObj.msg);
        error.status = errorObj.status;
        error.severity = errorObj.severity;
        error.params = params;
        error.nativeError = nativeErrorObj;

        if (process.env.NODE_ENV!='production') {
            res.status(errorObj.status).send(format(error));
        } else {
            res.status(errorObj.status).send(error);
        }
        return error;
    } catch (unexpError){
        errorObj = errorCodes.unknown;

        let error = new Error(errorObj.msg);
        error.status = errorObj.status;
        error.severity = errorObj.severity;

        if (process.env.NODE_ENV!='production') {
            res.status(errorObj.status).send(format(error));
        } else {
            res.status(errorObj.status).send(error);
        }
        return errorTag;
    }
};

export function getExtendedError (errorTag, nativeErrorObj=null, params=null){
    let errorObj;
    if (_.isObject(errorTag)) {
        errorObj = errorTag;
    } else if(_.isString(errorTag)) {
        errorObj = errorCodes[errorTag];
    } else {
        throw new Error('bad error format');
    }

    let error = new Error(errorObj.msg);
    error.status = errorObj.status;
    error.severity = errorObj.severity;
    error.params = params;
    error.nativeError = nativeErrorObj;
    if (process.env.NODE_ENV!='production') {
        error.output = format(error);
    }

    return error;
}

export function sendSocketErr (fn, errorTag, nativeErrorObj=null, params=null) {
    let error = getExtendedError(errorTag, nativeErrorObj, params);
    fn && fn(error);
};