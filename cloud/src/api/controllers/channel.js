'use strict';

const passport = require('passport');
const Channel = require('../../shared/models/channel');
const socketioJwt = require('socketio-jwt');
const SockRouter = require('socket.io-events');
const {ChannelOperations} = require('./channel/channel.operations.js');
const {appActionsLimiter} = require('./channel/channel.limiters.js');
const {pushAddInputValidator,pushEditInputValidator} = require('./channel/channel.validators.js');
const {pushAddSugar,bulkSugar} = require('./channel/channel.sugar.js');
const {ChannelCommands} = require('./channel/channel.commands.js');
const {errorCodes,getExtendedError} = require('../helpers/error.codes');

module.exports.controller = (router, bfPolicies) => {
    router
        .get('/channel/:id',
            bfPolicies.team.queries, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            (req, res, next) => {
                Channel.findOne({
                    _id: req.params.id,
                    appId: req.user._id
                }, (err, ch) => {
                    if (err || !ch) return next(err)
                    res.send(ch);
                });
        });
};


module.exports.socketSetup = function (
    config,
    logger,
    io,
    socketsManager,
    analytics,
    bfPolicies,
    updater){

    logger.debug('Setting-up Channel Sockets ');

    // set authorization for socket.io
    io.of('/channel').use(socketioJwt.authorize({
            secret: config.channelAuth.secret,
            handshake: true
        })
    );

    ////////////////////// ~~~~~~ SOCKET MIDDLEWARE ~~~~~~//////////////////////

    io.of('/channel').use(function(socket, next){
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
        socketWrapper.channelId = socketWrapper.sock.channelId;
        socketWrapper.appId = socketWrapper.sock.appId;
        socketWrapper.roomName = socketWrapper.sock.roomName;
        socketWrapper.logger = logger;
        socketWrapper.io = io;
        socketWrapper.config = config;
        next();
    });

    // sugar inputs of push:add
    // validate inputs of push:add
    // make sure push:add is limited
    sockRouter.on(
        ChannelCommands.pushAddCommand,
        bfPolicies.socket.adds, // bruteforce protection
        pushAddSugar,
        pushAddInputValidator,
        appActionsLimiter
    );

    // sugar inputs of bulk
    sockRouter.on(
        ChannelCommands.bulkCommand,
        bulkSugar
    );

    // validate inputs of push:edit
    sockRouter.on(
        ChannelCommands.pushEditCommand,
        bfPolicies.socket.edits, // bruteforce protection
        pushEditInputValidator
    );

    // protect inputs of push:delete
    sockRouter.on(
        ChannelCommands.pushDeleteCommand,
        bfPolicies.socket.changes // bruteforce protection
    );

    // protect inputs of push:query
    sockRouter.on(
        ChannelCommands.pushQueryCommand,
        bfPolicies.socket.queries // bruteforce protection
    );

    // protect inputs of user:query
    sockRouter.on(
        ChannelCommands.userQueryCommand,
        bfPolicies.socket.queries // bruteforce protection
    );

    // protect inputs of user:get
    sockRouter.on(
        ChannelCommands.userGetCommand,
        bfPolicies.socket.queries // bruteforce protection
    );

    io.of('/channel').use(sockRouter);

    io.of('/channel').on('connect', function(socket) {
        // >>> ~~~~~~ #connections limiter
        socketsManager.addChannelConnection(socket.decoded_token.appId, socket);

        let roomName = `${socket.decoded_token.channelId}@${socket.decoded_token.appId}`;

        //this socket is authenticated, we are good to handle more events from it.
        logger.debug(`channel socket connected to room ${roomName}`);

        // >>> ~~~~~~ join room
        socket.join(roomName);
        socket.roomName = roomName;
        // setup variables we'll need later in the chain
        socket.userId = socket.decoded_token.userId;
        socket.channelId = socket.decoded_token.channelId;
        socket.appId = socket.decoded_token.appId;

        let channelOperations = new ChannelOperations(
            logger,
            io,
            socket,
            roomName,
            analytics,
            config,
            updater);

        ////////////////////// ~~~~~~ USER OPERATIONS ~~~~~~//////////////////////
        socket.on(ChannelCommands.userGetCommand, channelOperations.userGet.bind(channelOperations));

        socket.on(ChannelCommands.userQueryCommand, channelOperations.userQuery.bind(channelOperations));

        ////////////////////// ~~~~~~ PUSH OPERATIONS ~~~~~~//////////////////////
        socket.on(ChannelCommands.pushQueryCommand, channelOperations.pushQuery.bind(channelOperations));

        socket.on(ChannelCommands.pushAddCommand, channelOperations.pushAdd.bind(channelOperations));

        socket.on(ChannelCommands.pushEditCommand, channelOperations.pushEdit.bind(channelOperations));

        socket.on(ChannelCommands.pushDeleteCommand, channelOperations.pushDelete.bind(channelOperations));

        if (process.env.NODE_ENV!=='production') {
            socket.on(ChannelCommands.bulkCommand, channelOperations.bulk.bind(channelOperations));
        }

        socket.on(ChannelCommands.analyticsAddCommand, channelOperations.analyticsAdd.bind(channelOperations));

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