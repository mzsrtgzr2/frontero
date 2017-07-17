
'use strict';

const expect = require('chai').expect;
const async = require('async');
const _ = require('underscore');
const {runParallelBruteforceTest, runSeriesBruteforceTest} = require('./../helpers/statics');

describe("04. New Entities",function(){

    let testDeveloperSetup = {
        email: 'test004developer@frontero.com',
        username: 'test004developer_username',
        password: 'test004developer_password'
    };

    let testAppSetup = {
        name: 'appTest100'
    };

    let user1 = {
        username: 'fronteroUUser004_1',
        email: 'fronteroUUser004_1@gmail.co',
        pic: 'http://ghk.h-cdn.co/assets/16/09/980x490/landscape-1457107485-gettyimages-512366437.jpg'
    };

    let testChannelName = 'channelTestNews010';

    let app;



    before(async function (done) {
        this.timeout(10000);

        await global.setup.teamClient.debug().set_bruteforce(true);

        global.setup.cleanCache(()=>{
            global.setup.setupNewApp(testDeveloperSetup, testAppSetup, (err, _app)=>{
                if (err){
                    done(err);
                } else {
                    app = _app; // save for later
                    done();
                }
            });
        });


    });

    beforeEach(function(done) {
        global.setup.cleanCache(done);
    });


    // attack w/ many connections with unique users each call
    it("attack with many new users", function(done){
        this.timeout(10000);

        let limit = global.setup.serverConfig.limit.bruteforce.usersCreations[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=> {

                try {
                    global.setup.createClient(); // we recreate the client, so all clean now
                    let channel = global.setup.client.channel({
                        channelName: `_test10Channel_`,
                        key: app.key,
                        secret: app.secret,
                        user: { // new user every swing!
                            username: `fronteroUUser10_attack100_${i}`,
                            email: `fronteroUUser10_attack100_${i}@gmail.com`,
                            pic: 'http://ghk.h-cdn.co/assets/16/09/980x490/landscape-1457107485-gettyimages-512366437.jpg'
                        }
                    });

                    channel.connect().then(
                        success=>{
                            callback(null, true);
                        },
                        fail => {
                            callback(null, false);
                        }
                    );

                } catch (excep){
                    console.error(excep);
                    callback(excep);
                }


        };


        runSeriesBruteforceTest(
            _oneSwingOfTheAttack,
            limit*3, // # size of the attack
            limit // expected to be allowed
        ).then(done, done);
    });

    // attack w/ many connections with unique channel-names each call
    it("attack with many new channels names", function(done){
        this.timeout(10000);

        let limit = global.setup.serverConfig.limit.bruteforce.channelCreations[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=> {
            try {
                global.setup.createClient(); // we recreate the client, so all clean now
                let channel = global.setup.client.channel({
                    channelName: `_test10Channel_${i}`, // new channel every swing!
                    key: app.key,
                    secret: app.secret,
                    user: {
                        username: `fronteroUUser10_attack100`,
                        email: `fronteroUUser10_attack100@gmail.com`,
                        pic: 'http://ghk.h-cdn.co/assets/16/09/980x490/landscape-1457107485-gettyimages-512366437.jpg'
                    }
                });

                channel.connect().then(
                    success=>{
                        callback(null, true);
                    },
                    fail => {
                        callback(null, false);
                    }
                );

            } catch (excep){
                console.error(excep);
                callback(excep);
            }
        };


        runSeriesBruteforceTest(
            _oneSwingOfTheAttack,
            limit*3, // # size of the attack
            limit // expected to be allowed
        ).then(done, done);
    });



    after(function (done) {
        done();
    });

});