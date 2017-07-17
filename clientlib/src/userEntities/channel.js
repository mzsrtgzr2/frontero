import {ISocket} from './isocket/isocket';

export class Channel extends ISocket{
    
    constructor (setupManager, data={}) {
        super(setupManager, data);
    }

    connect () {
        var self = this;
        return new Promise( (resolve, reject) => {
            // ensure we are not already connected
            if (this.isConnected()){
                return reject(new Error('already connected'));
            }

            // request token
            this.setupManager.ajax.post(`/token-channel`, this._data).then((res) => { // success
                if (res &&
                    res.token &&
                    res.app) {

                    super.connect(res.token, 'channel').then(()=>{
                        // on success
                        resolve(self);
                    }, (err)=>{
                        // on fail
                        reject(err);
                        this.setState("disconnected");
                    })
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
    
}