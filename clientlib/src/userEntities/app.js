import {ISocket} from './isocket/isocket';

export class App extends ISocket{
    
    constructor (setupManager, data={}) {
        super(setupManager, data);
    }

    connect () {
        var self = this;
        return new Promise( (resolve, reject) => {
            // ensure we are not already connected
            if (this.isState('connected')){
                return reject(new Error('already connected'));
            }

            // request token
            this.setupManager.ajax.post(`/token-app`, this._data).then((res) => { // success
                if (res &&
                    res.token &&
                    res.app) {

                    super.connect(res.token, 'app').then(()=>{
                        // on success
                        resolve(self);
                    }, (err)=>{
                        // on fail
                        reject(err);
                        this.setState("disconnected");
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
    
}