
'use strict';

const expect = require('chai').expect;
const async = require('async');
const _ = require('underscore');
const {runParallelBruteforceTest, runSeriesBruteforceTest} = require('./../helpers/statics');

describe("11. Bruteforce channels",function(){

    let testDeveloperSetup = {
        email: 'test11developer@frontero.com',
        username: 'test11developer_username',
        password: 'test11developer_password'
    };

    let testAppSetup = {
        name: 'appTest1100'
    };

    let user1 = {
        username: 'fronteroUUser11_1',
        email: 'fronteroUUser10_1@gmail.co',
        pic: 'http://ghk.h-cdn.co/assets/16/09/980x490/landscape-1457107485-gettyimages-512366437.jpg'
    };

    let testChannelName = 'channelTestNews011';

    let app;

    let channel


    before(async function (done) {
        this.timeout(10000);

        await global.setup.teamClient.debug().set_bruteforce(true);


        global.setup.cleanCache(()=>{
            global.setup.setupNewApp(testDeveloperSetup, testAppSetup, (err, _app)=>{
                if (err){
                    done(err);
                } else {
                    app = _app; // save for later

                    global.setup.createClient(); // we recreate the client, so all clean now

                    channel = global.setup.client.channel({
                        channelName: testChannelName,
                        key: app.key,
                        secret: app.secret,
                        user: user1
                    });

                    channel.connect().then(
                        success=>{
                            done();
                        },
                        fail => {
                            done(fail);
                        }
                    );
                }
            });
        });


	 });

    beforeEach(function(done) {
        global.setup.cleanCache(done);
    });

    it("attack with push queries",function(done){

        this.timeout(10000);

        let limit = global.setup.serverConfig.limit.bruteforce.socketQueries[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=> {

            channel.send('push:query', {}).then( pushes=>{
                callback(null, true);
            }, err => {
                if (err && err.status==429){
                    callback(null, false);// blocked!
                } else {
                    callback(null, true);
                }

            });
        };

        runParallelBruteforceTest(
            _oneSwingOfTheAttack,
            limit*3, // # size of the attack
            limit // expected to be allowed
        ).then(done, done);

    });

    it("attack with push additions",function(done){

        this.timeout(10000);

        let limit = global.setup.serverConfig.limit.bruteforce.socketAdds[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=> {

            channel.send('push:add', `my push #${i}`).then( pushes=>{
                callback(null, true);
            }, err=>{
                if (err && err.status==429){
                    callback(null, false);// blocked!
                } else {
                    callback(null, true);
                }
            });
        };

        runParallelBruteforceTest(
            _oneSwingOfTheAttack,
            limit*3, // # size of the attack
            limit // expected to be allowed
        ).then(done, done);

    });

    it("attack with push edits",function(done){

        this.timeout(10000);

        let limit = global.setup.serverConfig.limit.bruteforce.socketEdits[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=> {

            channel.send('push:edit', 'bs data').then( pushes=>{
                callback(null, true);
            }, err=>{
                if (err && err.status==429){
                    callback(null, false);// blocked!
                } else {
                    callback(null, true);
                }
            });
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