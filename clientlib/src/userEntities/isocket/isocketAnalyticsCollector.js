
const objectAssign = require('object-assign');

export class ISocketAnalyticsCollector {
    constructor (setupManager, params) {
        this.setupManager = setupManager;
        this._data = params || {};
        this._data.activeMeasurements = {};
        this._data.finishedMeasurements = [];
    }

    startMeasurement (op) {
        let ts = new Date();
        let tag = `op_${ts}`;
        this._data.activeMeasurements[tag] = {
            op: op,
            timestamp: ts
        };
        return tag;
    }

    endMeasurement (tag, params) {
        let mes = this._data.activeMeasurements[tag];
        if (mes){
            let ts = mes.timestamp;

            // final object to describe measurement should look something like:
            // {
            //      op: ...,
            //      timestamp: ...,
            //      result: ...,
            //      rtt_s: ...
            // }
            if (this._data.finishedMeasurements) {
                this._data.finishedMeasurements.push(objectAssign(params, {
                    op: mes.op,
                    rtt_ms: new Date() - ts
                })); // insert to finished
            }

            delete this._data.activeMeasurements[tag]; // remove from pending
        }
    }

    getMeasurements (){
        let data = this._data.finishedMeasurements; // keep data for us to send to server
        this._data.finishedMeasurements = []; // clear in the meantime
        return data;
    }

}