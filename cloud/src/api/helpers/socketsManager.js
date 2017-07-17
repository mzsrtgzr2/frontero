'use strict';
const _ = require('underscore');

export class SocketsManager {

    constructor (config, logger){
        this.config = config;
        this.logger = logger;
        this.channelSockets = {};
    }

    getCurrentAppConnections  (appId){
        let appSockets = this.channelSockets[appId];
        if (appSockets){
            return appSockets.length;
        } else {
            return 0;
        }
    }

    isAppAllowedNewConnection (appId){
        let numOConns = this.getCurrentAppConnections(appId);
        this.logger.debug(`app ${appId} num of conns ${numOConns}`);
        return (numOConns < this.config.limit.app.maxParallelConnections);
    }

    addChannelConnection (appId, socket){
        let appSockets = this.channelSockets[appId];
        if (appSockets){
            appSockets.push(socket);
        } else {
            this.channelSockets[appId] = [socket];
        }
        //console.log(`after add channel connection we have ${this.channelSockets[appId].length} in this app`)

        //this.getTotal();
    }

    removeChannelConnection (appId, socket){
        let appSockets = this.channelSockets[appId];
        if (appSockets){
            let i = appSockets.indexOf(socket);
            if(i != -1) {
                appSockets.splice(i, 1);
            }
            //console.log(`after remove channel connection we have ${appSockets.length} in this app`)
        }

        //this.getTotal();
    }

    getTotal (){
        let total = _.reduce(this.channelSockets, (memory, appSockets)=>{
            return memory + appSockets.length;
        }, 0);
        //console.log('total is ' + total)
        return total;
    }
}