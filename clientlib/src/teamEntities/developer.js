const {App} = require('./app');

export class Developer {
    constructor(setupManager, _id, data={}) {
        this.setupManager = setupManager;
        this._id = _id;
        this._data = JSON.parse(JSON.stringify(data));
    }
    
    get () {
        return this.setupManager.ajax.get(`/developer/${this._id}`, {}, this.setupManager.tokenDeveloper);
    }

    getApps () {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.get(`/apps`, {}, this.setupManager.tokenDeveloper).then((res) => { // success
                let apps = [];
                res.forEach(app=>{
                    apps.push(new App(this.setupManager, app._id, app));
                });
                resolve(apps);
            }, (err) => { // fail
                reject(err);
            });
        });
    }

    create (data) {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.post(`/developer/`, data).then((res) => { // success
                this._data = res;
                this._data.password = undefined; // dont keep password
                this._id = res._id;
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }

    createApp (data) {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.post(`/app/`, data, this.setupManager.tokenDeveloper).then((res) => { // success
                resolve(new App(this.setupManager, res._id, res));
            }, (err) => {
                reject(err);
            });
        });
    }

    update (data) {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.put(`/developer/${this._id}`, data, this.setupManager.tokenDeveloper).then((res) => { // success
                this._data = res;
                this._id = res._id;
                resolve(res);
            }, (err) => {
                reject(err);
            });

        });
    }

    delete () {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.delete(`/developer/${this._id}`, {}, this.setupManager.tokenDeveloper).then((res) => { // success
                this._data = undefined;
                this._id = undefined;
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }
    
}