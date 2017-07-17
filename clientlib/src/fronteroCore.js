'use strict';

const {SetupManager} = require('./utils/SetupManager');
const {Channel} = require('./userEntities/channel');
const {App} = require('./userEntities/app');

export class FronteroCore {
    constructor(params={}) {
        let setupManager = this.setupManager = new SetupManager({
            endPoint: params.endPoint || 'http://localhost:3030'
        });

        this.channels = {};

        // analyticsUpdateInterval
        // - update the server w/ our measurements and analytics
        if (params.analyticsReporting != false) {
            this.analyticsUpdateInterval = setInterval(this.updateAnalytics.bind(this), 60000);
        }
    }

    app (params) {
        //this.kill (); // kill & clean everything

        // lets keep key+secret+user for later channel sockets to use
        this.appKey = params.key;
        this.appSecret = params.secret;
        this.userData = params.user;

        this._app = new App(this.setupManager, params);
        return this._app;
    }

    channel (params={}) {

        // we may want to first connect app and than use channel sockets
        // in that case we don't need to provide the key+secret+user again
        // we already have it from earlier
        params.key = params.key || this.appKey;
        params.secret = params.secret || this.appSecret;
        params.user = params.user || this.userData;

        let channelName = params.channelName;
        let ch = this.channels[channelName];
        if (!ch) {
            ch = this.channels[channelName] = new Channel(this.setupManager, params);
        }

        return ch;
    }


    kill () {
        // stop intervals
        if (this.analyticsUpdateInterval){
            clearInterval(this.analyticsUpdateInterval);
        }

        // disconnect all channels
        for (let channelName in this.channels){
            try {
                let ch = this.channels[channelName];
                ch.disconnect();
                ch.clearEvents();
            } catch (err){
                console.log(err)
            }
        }

        this.channels = {};
    }

    updateAnalytics (){
        if (this._app) {
            this._app.updateAnalytics();
        }

        for (let channelName in this.channels) {
            try {
                let ch = this.channels[channelName];
                ch.updateAnalytics();
            } catch (err) {
                console.log(err)
            }
        }
    }
};