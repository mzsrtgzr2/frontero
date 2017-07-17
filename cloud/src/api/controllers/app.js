'use strict';

const passport = require('passport');
const App = require('../../shared/models/app');
import {generateRandom} from '../helpers/security';
const socketioJwt = require('socketio-jwt');
const SockRouter = require('socket.io-events');
const {AppOperations} = require('./app/app.operations.js');
const {AppCommands} = require('./app/app.commands.js');

module.exports.controller = (router, bfPolicies) => {
	router
		.get('/app/:id',
            bfPolicies.team.queries, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            (req, res, next) => {
                App.findOne({
                    _id: req.params.id,
                    developerId: req.user._id
                }, (err, app) => {
                    if (err || !app) {
                        return next(err);
                    }
                    res.send(app);
                });
		})
        .get('/apps',
            bfPolicies.team.queries, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            (req, res, next) => {
                App.find({
                    developerId: req.user._id
                }, (err, apps) => {
                    if (err || !apps) {
                        return next(err);
                    }
                    res.send(apps);
                });
            })
		.post('/app',
            bfPolicies.team.creations, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
                async function (req, res, next){
                // generate the key and secret
                req.body.key = await generateRandom(10);
                req.body.secret = await generateRandom(48);
                // ref the developer of the app
                req.body.developerId = req.user._id;

                let app = new App(req.body);
                app.save((err, results) => {
                    if (err || !app) return next(err);
                    res.send(results);
                });
		})
        .post('/app/:id/secret',
            bfPolicies.team.changes, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            async function (req, res, next){

                // generate the secret
                req.body.secret = await generateRandom(48);

                // ref the developer of the app
                req.body.developerId = req.user._id;

                App.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        developerId: req.user._id
                    },
                    {
                        secret: req.body.secret
                    },
                    {}, // options
                    (err, saved) => {
                        if (err || !saved) return next(err);
                        App.findById(req.params.id, (err, app) => {
                            if (err || !app) return next(err);
                            res.send(app.secret); // return secret
                        });
                    });
            })
        .put('/app/:id',
            bfPolicies.team.changes, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            (req, res, next) => {
                req.body.developerId = req.user._id; // override

                let appData = {};

                if (req.body.name){
                    appData.name = req.body.name;
                }

                App.findOneAndUpdate(
                    {
                        _id: req.params.id,
                        developerId: req.user._id
                    },
                    appData,
                    {}, // options
                    (err, saved) => {
                        if (err || !saved) return next(err);
                        App.findById(req.params.id, (err, app) => {
                            if (err || !app) return next(err);
                            res.send(app);
                        });
                    });
        })
        .get('/app/:id/users',
            bfPolicies.team.queries, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            (req, res, next) => {
                return next("PAGINATION?"); //TBD -
                // first we make sure that this app belongs
                // to the current authenticated Developer
                App.findOne({
                    _id: req.params.id,
                    developerId: req.user._id
                }, (err, app) => {
                    if (err || !app) return next(err);

                    // now, let get those Users
                    User.find({
                        appId: app._id
                    }, (err, users)=>{
                        if (err || !users) return next(err);
                        res.send(users);
                    });
                });
        })
        .delete('/app/:id',
            bfPolicies.team.changes, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            (req, res, next) => {
                App.findOneAndRemove({
                    _id: req.params.id,
                    developerId: req.user._id
                }, (err, removed) => {
                    if (err) return next(err);
                    if (!removed) return next('youre not allowed to see this data');
                    res.send(removed._id);
                });
            });
};

module.exports.socketSetup = function (config, logger, io, socketsManager, analytics, bfPolicies){

    logger.debug('Setting-up App Sockets ');

    // set authorization for socket.io
    io.of('/app').use(socketioJwt.authorize({
            secret: config.appAuth.secret,
            handshake: true
        })
    );

    ////////////////////// ~~~~~~ SOCKET MIDDLEWARE ~~~~~~//////////////////////

    io.of('/app').use(function(socket, next){
        // >>> ~~~~~~ #connections limiter
        if (socketsManager.isAppAllowedNewConnection(socket.decoded_token.appId)){
            return next();
        } else if (config.limit.app.enabled==true) { // if limit enabled - send error
            return next(getExtendedError(errorCodes.plan_limit));
        } else {
            next();
        }
    });

    ////////////////////// ~~~~~~ SOCKET EVENT MIDDLEWARE ~~~~~~//////////////////////

    let sockRouter = SockRouter();

    sockRouter.on('*', function (socketWrapper, args, next) {
        socketWrapper.userId = socketWrapper.sock.userId;
        socketWrapper.appId = socketWrapper.sock.appId;
        socketWrapper.roomName = socketWrapper.sock.roomName;
        socketWrapper.logger = logger;
        socketWrapper.io = io;
        socketWrapper.config = config;
        next();
    });

    // protect inputs of user:query
    sockRouter.on(
        AppCommands.channelQueryCommand,
        bfPolicies.socket.queries // bruteforce protection
    );

    io.of('/app').use(sockRouter);

    io.of('/app').on('connect', function(socket) {

        let roomName = `${socket.decoded_token.userId}@${socket.decoded_token.appId}`;

        //this socket is authenticated, we are good to handle more events from it.
        logger.debug(`app socket connected to room ${roomName}`);

        // >>> ~~~~~~ join room
        socket.join(roomName);
        socket.roomName = roomName;
        // setup variables we'll need later in the chain
        socket.userId = socket.decoded_token.userId;
        socket.appId = socket.decoded_token.appId;

        let appOperations = new AppOperations(logger, io, socket, roomName, analytics, config);

        ////////////////////// ~~~~~~ CHANNEL OPERATIONS ~~~~~~//////////////////////
        socket.on(AppCommands.channelQueryCommand, appOperations.channelQuery.bind(appOperations));

        socket.on('disconnect', function() {
            if (socket &&
                socket.roomName &&
                socket.decoded_token &&
                socket.decoded_token.appId){

                logger.debug(`user ${socket.userId} disconnected from ${socket.roomName}`);

                // >>> ~~~~~~ #connections limiter
                socketsManager.removeChannelConnection(socket.decoded_token.appId, socket);
            }
        });

    });
};