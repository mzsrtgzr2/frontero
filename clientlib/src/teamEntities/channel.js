export class Channel{

    constructor (setupManager, _id, data={}) {
        this.setupManager = setupManager;
        this._id = _id;
        this._data = JSON.parse(JSON.stringify(data));
    }

    get () {
        return this.setupManager.ajax.get(`/channel/${this._id}`, {}, this.setupManager.tokenDeveloper);
    }

    create (data) {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.post(`/channel/`, data, this.setupManager.tokenDeveloper).then((res) => { // success
                this._data = res;
                this._id = res._id;
                resolve(res);
            }, () => {
                reject();
            });
        });
    }

    update (data) {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.put(`/app/${this._id}`, data, this.setupManager.tokenDeveloper).then((res) => { // success
                this._data = res;
                this._id = res._id;
                resolve(res);
            }, () => {
                reject();
            });
        });
    }

    delete () {
        return new Promise( (resolve, reject) => {
            this.setupManager.ajax.delete(`/app/${this._id}`, {}, this.setupManager.tokenDeveloper).then((res) => { // success
                this._data = undefined;
                this._id = undefined;
                resolve(res);
            }, () => {
                reject();
            });
        });
    }


}