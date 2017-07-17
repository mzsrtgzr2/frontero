const _req = require('superagent');

export class Ajax {
    constructor (setup){
        this.setup = setup;
    }

    get (relUrl,
         data,
         token) {
        return new Promise( (resolve, reject) => {
            _req.get(this.setup.getApiEndPoint() + relUrl)
                .send(data || {})
                .set('Authorization',`JWT ${token}`)
                .set('Accept', 'application/json')
                .end(function(err, res){
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.body);
                    }
                });

        });
    }

    post (  relUrl,
            data,
            token) {
        return new Promise( (resolve, reject) => {
            _req.post(this.setup.getApiEndPoint() + relUrl)
                .send(data || {})
                .set('Authorization',`JWT ${token}`)
                .set('Accept', 'application/json')
                .end(function(err, res){
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.body);
                    }
                });

        });
    }

    put (relUrl,
          data,
         token) {
        return new Promise( (resolve, reject) => {
            _req.put(this.setup.getApiEndPoint() + relUrl)
                .send(data || {})
                .set('Authorization',`JWT ${token}`)
                .set('Accept', 'application/json')
                .end(function(err, res){
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.body);
                    }
                });

        });
    }

    delete (relUrl,
          data,
          token) {
        return new Promise( (resolve, reject) => {
            _req.delete(this.setup.getApiEndPoint() + relUrl)
                .send(data || {})
                .set('Authorization',`JWT ${token}`)
                .set('Accept', 'application/json')
                .end(function(err, res){
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res.body);
                    }
                });

        });
    };


};

