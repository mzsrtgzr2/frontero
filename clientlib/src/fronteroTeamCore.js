'use strict';

const {SetupManager} = require('./utils/SetupManager');
const {Developer} = require('./teamEntities/developer');
const {App} = require('./teamEntities/app');
const {Debug} = require('./teamEntities/debug');

class FronteroTeamCore {
    constructor(params) {
        this.setupManager = new SetupManager(params || {
            endPoint: 'http://localhost:3030'
        });
    }

    debug () {
        // keep developer a singleton!
        if (!this._debug){
            this._debug = new Debug(this.setupManager);
        }
        return this._debug;
    }

    developer (_id) {
        // keep developer a singleton!
        if (!this._developer){
            this._developer = new Developer(this.setupManager, _id);
        }
        return this._developer;
    }

    authenticate (params) {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.post(`/token-developer`, params).then((res) => { // success
                if (res &&
                    res.token &&
                    res.developer) {
                    this._tokenDeveloper = res.token;
                    this.setupManager.tokenDeveloper = res.token;

                    this._developer = null; // clear existing developer mem
                    this.developer(res.developer._id, res.developer); // create our developer mem

                    resolve(res.token);
                } else {
                    reject(res);
                }
            }, (err) => {
                reject(err);
            });
        });
    }
};
module.exports.FronteroTeamCore = FronteroTeamCore;
module.exports.App = App;
