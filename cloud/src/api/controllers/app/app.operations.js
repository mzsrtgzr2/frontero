/**
 * Created by mosherot on 6/22/16.
 */
const App = require('../../../shared/models/app');
const Channel = require('../../../shared/models/channel');
const User = require('../../../shared/models/user');
const Push = require('../../../shared/models/push');
const _ = require('underscore');
const async = require("async");
const {AppCommands} = require('./app.commands.js');
const {errorCodes,sendSocketErr} = require('../../helpers/error.codes');


class AppOperations {
    constructor (logger, io, socket, roomName, analytics, config){
        this.io = io;
        this.socket = socket;
        this.config = config;
        this.roomName = roomName;
        this.logger = logger;
        this.analytics = analytics; // statsd server client
        this.userId = this.socket.decoded_token.userId;
        this.appId = socket.decoded_token.appId;
    }

    broadcast (command, data){
        this.io.of('/app').to(this.roomName).emit(command, data);
    }

    emit (command, data){
        this.socket.emit(command, data);
    }

    channelQuery(data, fn){
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

        Channel.paginate({
            appId: this.appId
        }, {
            offset: offset,
            limit: limit,
            sort: {
                updatedAt: -1
            }
        }).then(function(result) {
            fn(null, result.docs);
        });
    }
    
};

module.exports.AppOperations = AppOperations;