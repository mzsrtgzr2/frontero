/**
 * Created by mosherot on 6/14/16.
 */

export class Channel {

    constructor (setup, params) {
        this.setup = setup;
        this._data = params;
        this.socket = undefined;
        this.setState ("disconnected");
        this._eventsHandlers = {};
    }

    connect () {
        return new Promise( (resolve, reject) => {
            // ensure we are not already connected
            if (this.isState('connected')){
                return reject(new Error('already connected'));
            }

            // request token
            this.setup.ajax.post(`/token-app`, this._data).then((res) => { // success
                if (res &&
                    res.token &&
                    res.app) {

                    this.token = res.token;

                    this._data.query = `token=${this.token}`;
                    this._data.user.id = res.userId;
                    this.socket = this.setup.io.connect(this.setup.gettEndPoint(), this._data);

                    this.socket.on('connect', () => {
                        this.setState("connected");
                        this._data.query = undefined;
                        resolve(this);
                    });

                    this.socket.on("error", (error) => {
                        this.setState("disconnected");
                        throw new Error(`TBD: NOT IMPLEMENTED: ${error}`);
                    });

                    this.socket.on('push:added', (data) => {
                        this._eventsHandlers['push:added'] && this._eventsHandlers['push:added'](data);
                    });

                    this.socket.on('push:edited', (data) => {
                        this._eventsHandlers['push:edited'] && this._eventsHandlers['push:edited'](data);
                    });

                    this.socket.on('push:deleted', (data) => {
                        this._eventsHandlers['push:deleted'] && this._eventsHandlers['push:deleted'](data);
                    });

                    this.socket.on('disconnect', () => {
                        this.setState("disconnected");
                        this._eventsHandlers['disconnected'] && this._eventsHandlers['disconnected']();
                    });
                } else {
                    reject(new Error('authorization failed'));
                    this.setState("disconnected");
                }
            }, (err) => {
                reject(err);
                this.setState("disconnected");
            });
        });
    }

    on (eventName, eventHandler){
        this._eventsHandlers[eventName] = eventHandler;
    }

    clearEvents () {
        this._eventsHandlers = {};
    }

    send (eventName, data){
        return new Promise( (resolve, reject) => {
            if (this.socket) {
                this.socket.emit(eventName, data, (err, data)=>{
                    if (err){
                        reject(err);
                    } else {
                        resolve(data);
                    }
                });
            } else {
                reject(new Error('can send data when socket disconnected'));
            }
        });
    }

    disconnect () {
        this.socket && this.socket.disconnect();
    }

    setState (state) {
        this._state = state;
    }

    isState (state){
        return (this.getState() == state);
    }

    getState () {
        return this._state;
    }

    get () {
        return this.setup.ajax.get(`/channel/${this._id}`, {}, this.setup.tokenApp);
    }

    create (data) {
        return new Promise( (resolve, reject) => {
            this.setup.ajax.post(`/channel/`, data, this.setup.tokenApp).then((res) => { // success
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
            this.setup.ajax.put(`/app/${this._id}`, data, this.setup.tokenApp).then((res) => { // success
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
            this.setup.ajax.delete(`/app/${this._id}`, {}, this.setup.tokenApp).then((res) => { // success
                this._data = undefined;
                this._id = undefined;
                resolve(res);
            }, () => {
                reject();
            });
        });
    }

}
