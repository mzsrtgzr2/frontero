'use strict';
require("babel-polyfill"); // for es7 async/await runtime
const express = require('express');
const cors = require('cors');
const passport = require('passport');
const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;
const Strategy = passportJWT.Strategy;
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const defaultLogger = require('winston');
const killable = require('killable');
const securityHelpers = require('./helpers/security');
const CronJob = require('cron').CronJob;
const archive = require('./helpers/archive').archive;
const getState = require('./helpers/state').getState;
const helmet = require('helmet');
const art = require('ascii-art');
const Table = require('cli-table');
var StatsD = require('node-statsd'),
    analytics = new StatsD('analytics',8125);
const redis = require('redis');
const {SocketsManager} = require('./helpers/socketsManager');
var zmq = require('zmq')
    , sock = zmq.socket('push');


module.exports = (logger, config) => {

    sock.bindSync('tcp://0.0.0.0:3001');
    console.log('Producer bound to port 3001');

    logger.debug('Hello');
	const app = express();

    app.use(helmet()); // protect your app from some well-known web vulnerabilities by setting HTTP headers appropriately
    app.use(cors());

	app.set('logger',(logger || defaultLogger)); // keep logger available

	// lets setup the app
	let server = require('http').createServer(app);

	logger.debug("Overriding Logger");
	if (process.env.NODE_ENV=='test') {
        app.use(require('morgan')('combined', {"stream": logger.stream}));
    }

    app.use(bodyParser.urlencoded({extended: true}));
	app.use(bodyParser.json({type: '*/*'}));

	app.set('config', config);

    // Make config accessible to our router
    app.use(function(req,res,next){
        req.config = config;
        req.logger = logger;
        next();
    });


    //////////////
    // passport //
    //////////////
    logger.debug('Initializing Passport JWT Authentication');

    let strategyDeveloper = new Strategy({
        secretOrKey: config.developerAuth.secret,
        jwtFromRequest: ExtractJwt.fromAuthHeader()
    }, securityHelpers.authenticateDeveloper);

    passport.use('jwt-developers', strategyDeveloper);

    

    app.use(passport.initialize());



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

    let bfPolicies;

    if (process.env.NODE_ENV!='dev') {
        logger.debug('Initializing Brute-protection');

        /// ~~~
        /// ~~~ RATE LIMITER against BRUTEFORCE attacks
        /// ~~~ https://github.com/dudleycarr/ratelimit.js
        /// ~~~
        bfPolicies = {
            tokenDeveloper: securityHelpers.createExpressBfMiddleware(config.limit.bruteforce.tokenDeveloper, 'fr_bf_token_d_'),
            tokenApp: securityHelpers.createExpressBfMiddleware(config.limit.bruteforce.tokenApp,'fr_bf_token_a_'),
            team: {
                queries: securityHelpers.createExpressBfMiddleware(config.limit.bruteforce.teamQueries, 'fr_bf_team_q_'),
                changes: securityHelpers.createExpressBfMiddleware(config.limit.bruteforce.teamChanges, 'fr_bf_team_ch_'),
                creations: securityHelpers.createExpressBfMiddleware(config.limit.bruteforce.teamCreations, 'fr_bf_team_cr_')
            },
            channel: {
                creations: securityHelpers.createGenericBfLimiter(config.limit.bruteforce.channelCreations, 'fr_bf_ch_cr_')
            },
            users: {
                creations: securityHelpers.createGenericBfLimiter(config.limit.bruteforce.usersCreations, 'fr_bf_usr_cr_')
            },
            socket: {
                queries: securityHelpers.createSocketioBfMiddleware(config.limit.bruteforce.socketQueries, 'fr_bf_sck_q_'),
                edits: securityHelpers.createSocketioBfMiddleware(config.limit.bruteforce.socketEdits, 'fr_bf_sck_ed_'),
                adds: securityHelpers.createSocketioBfMiddleware(config.limit.bruteforce.socketAdds, 'fr_bf_sck_ad_'),
                analyticsAdds: securityHelpers.createSocketioBfMiddleware(config.limit.bruteforce.analyticsAdds, 'fr_bf_sck_an_ad_'),
            }
        };

    } else {
        logger.debug('Skipping Brute-protection');
        let _emptyMiddleware = function (req, res, next) {
            next(); // just move on
        };

        let _emptySocketMiddleware = function (socketWrapper, args, next)
        {
            next();
        };

        let _emptyGenericBf = {
            incr: function incr(key) {
                return new Promise((resolve)=> {
                    resolve(true);
                });
            },
            check: function check(key) {
                return new Promise((resolve)=> {
                    resolve(true);
                });
            }
        };

        bfPolicies = {
            tokenDeveloper: _emptyMiddleware,
            tokenApp: _emptyMiddleware,
            team: {
                queries: _emptyMiddleware,
                changes: _emptyMiddleware,
                creations: _emptyMiddleware
            },
            channel: {
                creations: _emptyGenericBf
            },
            users: {
                creations: _emptyGenericBf
            },
            socket: {
                queries: _emptySocketMiddleware,
                edits: _emptySocketMiddleware,
                adds: _emptySocketMiddleware
            }
        };

    }

	logger.debug('Initializing Sockets');

    let io = require('socket.io')(server);
    //io.adapter(require('socket.io-redis')({ host: 'redis', port: 6379 }));

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

    let socketsManager = new SocketsManager(config, logger);

    require('./controllers/app').socketSetup(
                                            config,
                                            logger,
                                            io,
                                            socketsManager,
                                            analytics,
                                            bfPolicies);

    require('./controllers/channel').socketSetup(
        config,
        logger,
        io,
        socketsManager,
        analytics,
        bfPolicies,
        sock);


	// Make io accessible to our router
	app.use(function(req,res,next){
	    req.io = io;
	    next();
	});


	logger.debug('Initializing Router');
	let router = express.Router();

	let dashboardApiRouter = express.Router();
    require('./controllers/auth').controller(dashboardApiRouter, bfPolicies);
	require('./controllers/developer').controller(dashboardApiRouter, bfPolicies);
	require('./controllers/app').controller(dashboardApiRouter, bfPolicies);
    require('./controllers/channel').controller(dashboardApiRouter, bfPolicies);

    if (process.env.NODE_ENV!=='production'){
        require('./controllers/debug').controller(dashboardApiRouter, bfPolicies);
    }

	router.use('/',dashboardApiRouter); // attach subrouter to router

	app.use('/api', router);

    killable(server);

    server.on('close',function (){
        // what to do when shutting server down?
        db.close(); // - close db connection
    });

    if (process.env.NODE_ENV=='production') {
        logger.debug('Initializing Archive CRON Task');

        let archiveJob = new CronJob({
            cronTime: '00 50 23 * * *', // every Day @ 23:50
            onTick: ()=>{
                archive(logger, config);
            },
            start: true
        });
    } else {
        logger.debug('Skipping Archive CRON Task');
    }

    logger.debug('Initializing StateSniffer CRON Task');

    let serverStateSnifferJob = new CronJob({
        cronTime: '*/30 * * * * *', // every 30 seconds
        onTick: async function (){
            let state = await getState(logger, config, socketsManager);
            // instantiate
            var table = new Table();

            table.push(
                {'#Apps': state.totalNumOfApps},
                {'#Users': state.totalNumOfUsers},
                {'#Channels': state.totalNumOfChannels},
                {'#Pushes': state.totalNumOfPushes},
                {'#Sockets': state.totalNumOfSockets}
            );

            analytics.gauge('total_apps', state.totalNumOfApps);
            analytics.gauge('total_users', state.totalNumOfUsers);
            analytics.gauge('total_channels', state.totalNumOfChannels);
            analytics.gauge('total_pushes', state.totalNumOfPushes);
            analytics.gauge('total_sockets', state.totalNumOfSockets);

            //console.log(table.toString());

        },
        start: true
    });


    art.font('Fr', 'Doom', 'magenta').font('Api', 'Doom', 'red', function(rendered){
        console.log(rendered);
    });

	return server;
}
