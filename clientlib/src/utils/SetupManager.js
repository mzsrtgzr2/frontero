
const {Ajax} = require('../ajax/ajax');

export class SetupManager {
    constructor (_config){
        this.config = _config || {};
        this.ajax = new Ajax(this);
    }

    gettEndPoint () {
        return this.config.endPoint;
    }

    getApiEndPoint () {
        return this.gettEndPoint() + '/api';
    }
}