/**
 * Created by mosherot on 6/14/16.
 */

export class App {
    constructor(setupManager, _id, _data = {}) {
        this.setupManager = setupManager;
        this._id = _id;
        this._data = JSON.parse(JSON.stringify(_data));
    }

    get () {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.get(`/app/${this._id}`, {}, this.setupManager.tokenDeveloper).then((res) => { // success
                this._data = res;
                this._id = res._id;
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }

    update (data) {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.put(`/app/${this._id}`, data, this.setupManager.tokenDeveloper).then((res) => { // success
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
            this.setupManager.ajax.delete(`/app/${this._id}`, {}, this.setupManager.tokenDeveloper).then((res) => { // success
                this._data = undefined;
                this._id = undefined;
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }

    regenerateSecret (){
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.post(`/app/${this._id}/secret`, {}, this.setupManager.tokenDeveloper).then((res) => { // success
                this._data.secret = res;
                resolve(res);
            }, (err) => {
                reject(err);
            });
        });
    }

    get id(){
        return this._id;
    }

    get name(){
        return this._data.name;
    }

    get key(){
        return this._data.key;
    }

    get secret(){
        return this._data.secret;
    }
}