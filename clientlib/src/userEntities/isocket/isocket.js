import {ISocketAnalyticsCollector} from './isocketAnalyticsCollector';

export class ISocket {

    constructor (setupManager, data={}) {
        this.setupManager = setupManager;
        this._data = JSON.parse(JSON.stringify(data));
        this.socket = undefined;
        this.setState ("disconnected");
        this._eventsHandlers = {};
        this.analytics = new ISocketAnalyticsCollector(this.setupManager);
    }

    connect (token, namespace) {
        return new Promise( (resolve, reject) => {
            // ensure we are not already connected
            if (this.isConnected()){
                return reject(new Error('already connected'));
            }

            let data = {
                query: `token=${token}`,
                'force new connection': true
            }

            //console.log('socket using token ' + token + ' for namespace ' + namespace);

            this.socket = require('socket.io-client').connect(
                this.setupManager.gettEndPoint() + '/' + namespace,
                data);

            this.socket.on('connect', () => {
                this.setState("connected");
                this.token = token; // that token worked! keep it!
                resolve(this);
            });

            this.socket.on("error", (error) => {
                this.setState("disconnected");
                throw error;
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
        });
    }

    on (eventName, eventHandler){
        this._eventsHandlers[eventName] = eventHandler;
    }

    clearEvents () {
        this._eventsHandlers = {};
    }

    send (eventName, data){
        let isMeasured = !eventName.startsWith('analytics');
        let measuredTag;
        return new Promise( (resolve, reject) => {
            if (!this.isConnected()){
                return reject(new Error('not connected'));
            }

            if (this.socket) {

                // ~~~ MEASURE START
                if (isMeasured){
                    measuredTag = this.analytics.startMeasurement(eventName);
                }

                // ~~~ SEND DATA
                this.socket.emit(eventName, data, (err, data)=>{
                    if (err){

                        // ~~~ MEASURE END
                        isMeasured &&
                        this.analytics.endMeasurement(measuredTag, {
                            result: false
                        });

                        reject(err);
                    } else {

                        // ~~~ MEASURE END
                        isMeasured &&
                        this.analytics.endMeasurement(measuredTag, {
                            result: true
                        });

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

    isConnected (){
        return this.getState() == 'connected';
    }

    getCollectedAnalytics () {
        return this.analytics.getMeasurements();
    }

    updateAnalytics () {
        return new Promise((resolve, reject)=>{
            if (this.isConnected()){
                let measurements = this.getCollectedAnalytics();
                if (Object.keys(measurements).length>0){
                    this.send('analytics:add',
                        measurements)
                        .then(resolve, reject);
                } else {
                    resolve(false);
                }
            } else {
                reject (new Error('socket done'));
            }
        });

    }

}