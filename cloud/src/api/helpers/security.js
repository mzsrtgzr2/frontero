const Developer = require('../../shared/models/developer');
const App = require('../../shared/models/app');
const HttpStatus = require('http-status-codes');
const RateLimit = require('ratelimit.js').RateLimit;
const ExpressMiddleware = require('ratelimit.js').ExpressMiddleware;
const redis = require('redis');
const {errorCodes,sendSocketErr} = require('./error.codes.js');

export function generateRandom (n){
    return new Promise((resolve, reject)=>{
        require('crypto').randomBytes(n, function(err, buffer) {
            if (err){
                reject();
            } else {
                resolve(buffer.toString('hex'));
            }
        });
    });
}

export function authenticateDeveloper (payload, done) {
    Developer.findById(payload._id, (err, developer) => {
        if (err || !developer) {
            return done(new Error("Developer not found"), null);
        } else {
            return done(null, developer);
        }
    });
}


export function authenticateApp (payload, done) {
    App.findById(payload.appId, (err, app) => {
        if (err || !app) {
            return done(new Error("App not found"), null);
        } else {
            return done(null, app);
        }
    });
}

export function createExpressBfMiddleware (rules=[{interval: 10, limit: 2}], prefix='fr_'){
    let client = redis.createClient('6379', 'redis');

    var rateLimiter = new RateLimit(client, rules, {prefix: prefix});

    var options = {
        ignoreRedisErrors: true // defaults to false
    };

    let limitMiddleware = new ExpressMiddleware(rateLimiter, options);


    let limitMiddlewareFunc = limitMiddleware.middleware(function (req, res, next) {
        res.status(HttpStatus.TOO_MANY_REQUESTS).json({message: 'rate limit exceeded'}).end();
    });

    return function (req, res, next) {
        if (req.config.limit.bruteforce.enabled==true) {
            limitMiddlewareFunc(req, res, next);
        } else {
            next();
        }
    };
}

export function createSocketioBfMiddleware (rules=[{interval: 10, limit: 2}], prefix='fr_'){

    let client = redis.createClient('6379', 'redis');

    let limiter = new RateLimit(client, rules, {prefix: prefix});

    let middleware = function (socketWrapper, args, next)
    {
        if (socketWrapper.config.limit.bruteforce.enabled==true) {
            limiter.incr(socketWrapper.sock.handshake.address, (err, isRateLimited)=> {
                if (err || isRateLimited == true) {
                    let fn = args[2];
                    sendSocketErr(
                        fn,
                        errorCodes.bruteforce,
                        err
                    );
                } else {
                    return next(); // move along.. move along..
                }
            });
        } else {
            return next(); // bruteforce isn't enabled
        }

    };

    return middleware;
}

export function createGenericBfLimiter (rules=[{interval: 10, limit: 2}], prefix='fr_'){

    let client = redis.createClient('6379', 'redis');

    let limiter = new RateLimit(client, rules, {prefix: prefix});

    return {
        incr: function incr(key) {
            return new Promise((resolve)=> {
                limiter.incr(key, (err, isRateLimited) => {
                    if (err || isRateLimited) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        },
        check: function check(key) {
            return new Promise((resolve)=> {
                limiter.check(key, (err, isRateLimited) => {
                    if (err || isRateLimited) {
                        resolve(false);
                    } else {
                        resolve(true);
                    }
                });
            });
        }
    };
}