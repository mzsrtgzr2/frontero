'use strict';
require("babel-polyfill");
const config = require('../../src/api/config/index');
const logger = require('../../src/api/helpers/logger');
const {FronteroCore} = require("./clientlib/src/fronteroCore");
const {FronteroTeamCore} = require("./clientlib/src/fronteroTeamCore");

export class TestSetup {
	constructor(isLoadServer=true){
		this.log = logger;
        this.serverConfig = config;
        if (isLoadServer &&
            process.env.LOAD_SERVER=='yes') {
            logger.debug('Server Loading is enabled!');
            this.server = require('../../src/api/app')(logger, config);
        } else {
            //logger.debug('Skipped Server Setup');
        }
        this.createTeamClient();
        this.createClient();
	}

    createTeamClient () {
        this.teamClient = new FronteroTeamCore({
            endPoint: `http://localhost:${config.port}`
        });
    }

    createClient () {
        this.client = new FronteroCore({
            endPoint: `http://localhost:${config.port}`,
            analyticsReporting: true
        });
    }

    killClient () {
        if (this.client) {
            this.client.kill();
        }
    }

	start (cb){
        if (this.server) {
            this.server.listen(config.port,cb);
        } else {
            //logger.debug('Skipped Server Start');
            cb && cb();
        }
	}

	kill () {
        return new Promise ((resolve,reject)=>{
            this.killClient();
            if (this.server) {
                this.server.kill(resolve);
            } else {
                //logger.debug('Skipped Server Kill');
                resolve();
            }
        });
	}

	clean (done){
        //logger.debug('Asking Server to Empty DB');
        this.teamClient.debug().emptyDb().then(()=>{
            this.cleanCache(done); // also clean cache
        });
	}

    cleanCache (done){
        //logger.debug('Asking Server to Empty Cache');
        this.teamClient.debug().emptyCache().then(done);
    }

    async setupNewApp (developerData, appData, done) {
        try {
            let developer = this.teamClient.developer();
            await developer.create(developerData);
            await this.teamClient.authenticate({
                    username: developerData.username,
                    password: developerData.password
                });
            let app = await developer.createApp(appData);
            done(null, app);
        } catch (e) {
            done(e);
        }
    }
};