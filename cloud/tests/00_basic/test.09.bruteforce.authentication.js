
'use strict';

const expect = require('chai').expect;
const {runParallelBruteforceTest} = require('./../helpers/statics');

describe("09. Bruteforce auth-api",function(){

    let developer;

    let testDeveloperSetup = {
        email: 'test08developer@frontero.com',
        username: 'test08developer_username',
        password: 'test08developer_password'
    };


    before(async function (done) {
        this.timeout(10000);

        await global.setup.teamClient.debug().set_bruteforce(true);

        global.setup.cleanCache(()=>{
            developer = global.setup.teamClient.developer();

            developer.create(testDeveloperSetup).then((res) => { // success
                done();
            }, (err) => {
                done(err);
            });
        });
	 });

    beforeEach(function(done) {
        global.setup.cleanCache(done);
    });

	it("attack with developer authentication",function(done){
        this.timeout(10000);
        let limit = global.setup.serverConfig.limit.bruteforce.tokenDeveloper[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=>{
            global.setup.teamClient.authenticate({
                username: `badbadbad${i}`,
                password: `dabdabdab${i}`
            }).then((res) => { // success
                callback(null, true);
            }, (err) => {
                // 401 means we can't authenticate
                // because we didn't find the credentials
                // it means the message wasn't limited - server did a DB query :)
                if (err.status==401) {
                    callback(null, true);
                } else {
                    // any other error we assume its error 429 (TOO_MANY_REQUESTS) or
                    // CONNECTION_ERROR for doing to many http requests all at once.
                    callback(null, false);
                }
            });
        };

        runParallelBruteforceTest(
            _oneSwingOfTheAttack,
            limit*3, // # size of the attack
            limit // expected to be allowed
        ).then(done, done);
    });

    it("attack with app(channel) authentication", function(done){
        this.timeout(10000);

        let limit = global.setup.serverConfig.limit.bruteforce.tokenApp[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=>{
            global.setup.createClient(); // we recreate the client, so all clean now
            let channel = global.setup.client.channel({
                channelName: 'fake',
                key: 'fake',
                secret: 'fake',
                user: 'fake'
            });

            channel.connect().then(
                success=>{
                    callback(null, true);
                },
                err => {
                    if (err && err.status==429){
                        //error 429 (TOO_MANY_REQUESTS) means its limited!
                        callback(null, false);
                    } else if (err && err.status==422){
                        // 422 - Unprocessable Entity - means the req wan't limited, it went to validation
                        callback(null, true);
                    } else {
                        callback(new Error(`cant be error status ${err}`))
                    }

                }
            );
        };

        runParallelBruteforceTest(
            _oneSwingOfTheAttack,
            limit*3, // # size of the attack
            limit // expected to be allowed
        ).then(done, done);
    });

    after(function (done) {
        done();
    });

});