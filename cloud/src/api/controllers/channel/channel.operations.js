/**
 * Created by mosherot on 6/22/16.
 */
const App = require('../../../shared/models/app');
const Channel = require('../../../shared/models/channel');
const User = require('../../../shared/models/user');
const Push = require('../../../shared/models/push');
const _ = require('underscore');
const async = require("async");
const {ChannelCommands} = require('./channel.commands.js');
const {errorCodes,sendSocketErr} = require('../../helpers/error.codes');


class ChannelOperations {
    constructor (logger, io, socket, roomName, analytics, config, updater){
        this.io = io;
        this.socket = socket;
        this.config = config;
        this.roomName = roomName;
        this.logger = logger;
        this.analytics = analytics; // statsd server client
        this.updater = updater;
        this.userId = this.socket.decoded_token.userId;
        this.channelId = socket.decoded_token.channelId;
        this.appId = socket.decoded_token.appId;
    }

    broadcast (command, data){
        this.updater.send(JSON.stringify({
            roomName: this.roomName,
            command: command,
            data: data
        }));
    }

    emit (command, data){
        this.socket.emit(command, data);
    }

    pushQuery(data, fn){
        this.logger.debug(`querying push: ${data}`);
        let offset = 0;
        let limit = 10;

        if (data){
            if (data.offset){
                offset = data.offset;
            }

            if (data.limit){
                limit = data.limit;
            }
        } else {
            data = {};
        }

        limit = Math.min(this.config.limit.query.maxInOneQuery, limit);

        Push.paginate({
            channelId: this.channelId,
            parent: data.parentId || undefined
        }, {
            offset: offset,
            limit: limit,
            sort: {
                createdAt: -1
            }
        }).then(function(result) {
            fn(null, result.docs);
        });
    }


    pushAdd (data, fn){
        this.logger.debug(`adding push: ${data}`);
        let pushPayload;

        if (data && data.payload) {
            pushPayload = data.payload;
        } else {
            sendSocketErr(
                fn,
                errorCodes.unexpected_op
            );
            return;
        }

        let _save = (pushed, parent) => {
            pushed.save((err, results) => {
                if (err){
                    sendSocketErr(
                        fn,
                        errorCodes.unexpected_err,
                        err
                    );
                } else if (!results) {
                    sendSocketErr(
                        fn,
                        errorCodes.unexpected_err,
                        err
                    );
                } else {
                    // all good, channel was created
                    fn && fn(null, results);
                    this.broadcast('push:added', results);
                }
            });
        };

        if (data.parentId) {
            // we need to pend this Push to a parent-Push
            // make sure this parent is on the same channel
            // as this new Push is going to be
            Push.findOne({
                _id: data.parentId,
                channelId: this.channelId
            }, (err,parent)=>{
                if (err || !parent){
                    sendSocketErr(
                        fn,
                        errorCodes.unexpected_err,
                        err
                    );
                } else {
                    _save(new Push({
                        userId: this.userId,
                        payload: pushPayload,
                        channelId: this.channelId,
                        appId: this.appId,
                        parent: parent // null eq a parentless push
                    }), parent);
                }
            });
        } else {
            _save(new Push({
                userId: this.userId,
                payload: pushPayload,
                channelId: this.channelId,
                appId: this.appId
            }));
        }

    }


    pushEdit(push, fn){
        this.logger.debug(`updating push to ${push}`);
        Push.findOneAndUpdate(
            {
                _id: push._id,
                channelId: this.channelId,
                userId: this.userId
            }, {
                $set: {
                    payload: push.payload
                }
            },
            {}, // options
            (err, saved) => {
                if (err){
                    return sendSocketErr(
                        fn,
                        errorCodes.unexpected_err,
                        err
                    );
                }
                if (!saved){
                    return sendSocketErr(
                        fn,
                        errorCodes.resource_not_found
                    );
                }
                
                Push.findById(push._id, (err, fetched) => {
                    if (err || !fetched) {
                        return sendSocketErr(
                            fn,
                            errorCodes.resource_not_found,
                            err
                            );
                    } else {
                        fn && fn(null, fetched);
                        this.broadcast('push:edited', fetched);

                    }
                });

            });
    }


    pushDelete (pushId, fn){
        this.logger.debug(`delete push: ${pushId}`);
        Push.findOne({
            _id: pushId,
            channelId: this.channelId,
            userId: this.userId
        }, (err, push) => {
            if (err || !push) {
                sendSocketErr(
                    fn,
                    errorCodes.resource_not_found,
                    err
                );
            } else {

                push.remove((err)=>{
                    if (err) {
                        sendSocketErr(
                            fn,
                            errorCodes.unexpected_err,
                            err
                        );
                    } else {

                        this.broadcast('push:deleted', pushId);
                        fn && fn(null, pushId);

                    }
                });

            }
        });
    };


    bulk (commands, fn){
        this.logger.debug(`bulk for command ${commands}`);
        let tasks = _.map(commands,
            (command)=>{
                switch(command.type){
                    case ChannelCommands.pushAddCommand:
                        return this.pushAdd.bind(this, command.data); // binding the data to the function
                        break;
                    case ChannelCommands.pushEditCommand:
                        return this.pushEdit.bind(this, command.data); // binding the data to the function
                        break;
                    case ChannelCommands.pushDeleteCommand:
                        return this.pushDelete.bind(this, command.data); // binding the data to the function
                        break;
                    default:
                        return (cb)=>{cb(null,true)}; // default returns empty
                        break;
                }
            });
        async.series(tasks,
            function (err, res){
                // All tasks are done now
                if (!err) {
                    fn && fn(null, res);
                } else {
                    sendSocketErr(
                        fn,
                        errorCodes.resource_not_found,
                        err
                    );
                }
            }
        );
    }

    userGet (id, fn){
        User.findOne({
            _id: id,
            appId: this.appId
        }, function (err, results){
            fn(null, results);
        });
    }

    userQuery (data, fn){
        let offset = 0;
        let limit = 10;

        if (data){
            if (data.offset){
                offset = data.offset;
            }

            if (data.limit){
                limit = data.limit;
            }
        }

        limit = Math.min(this.config.limit.query.maxInOneQuery, limit);

        User.paginate({
            appId: this.appId
        }, {
            offset: offset,
            limit: limit,
            sort: {
                createdAt: -1
            }
        }).then(function(result) {
            fn(null, result.docs);
        });
    }

    analyticsAdd (data, fn){
        _.each(data, (value)=>{
            let op = value.op;
            switch (op){
                case ChannelCommands.pushQueryCommand:
                    op = 'push_query';
                    break;
                case ChannelCommands.pushAddCommand:
                    op = 'push_add';
                    break;
                case ChannelCommands.pushDeleteCommand:
                    op = 'push_delete';
                    break;
                case ChannelCommands.pushEditCommand:
                    op = 'push_edit';
                    break;
                case ChannelCommands.userGetCommand:
                    op = 'user_get';
                    break;
                case ChannelCommands.userQueryCommand:
                    op = 'user_query';
                    break;
                default:
                    op = 'unknown';
            }
            let rtt_ms = value.rtt_ms;
            //console.log(`user_socket_rtt.${op} - ${rtt_ms}`);
            this.analytics.timing(`user_socket_rtt.${op}`,rtt_ms);
        });

        fn( null, true);
    }
    
};

module.exports.ChannelOperations = ChannelOperations;