
'use strict';

const expect = require('chai').expect;
const _ = require('underscore');
const async = require("async");

describe("06. (Sockets per App) limits",function(){

    let testDeveloperSetup = {
        email: 'test05developer@frontero.com',
        username: 'test05developer_username',
        password: 'test05developer_password'
    };

    let testApp1Setup = {
        name: 'appTest05'
    };

    let testChanneName2 = 'channelTestNews005_2';

    let app1;
    let channel;

    before(async function (done) {
        await global.setup.teamClient.debug().set_app_limits(true);
        
        global.setup.cleanCache(()=> {
            global.setup.setupNewApp(testDeveloperSetup, testApp1Setup, (err, _app)=> {
                if (err) {
                    done(err);
                } else {
                    app1 = _app; // save for later

                    global.setup.createClient(); // we recreate the client, so all clean now
                    done();
                }
            });
        });

    });

    beforeEach(function(done) {
        if (channel){
            channel.clearEvents();
        }
        global.setup.cleanCache(done);
    });


    it("open more channels than allowed concurrently and get denied",function(done){
        this.timeout(10000); // can be a long test

        // lets get the concurrent #sockets limitation
        let maxParallelConnections = global.setup.serverConfig.limit.app.maxParallelConnections;
        let setup = global.setup;

        let tasks = _.map(_.range(maxParallelConnections),
            (i)=>{
                return (cb)=>{

                    setup.createClient(); // create new client

                    let ch = setup.client.channel({
                        channelName: `${testChanneName2}`, // new channel every time
                        key: app1._data.key,
                        secret: app1._data.secret,
                        user: {
                            username: `fronteroUUser555`,
                            email: `fronteroUUser555@gmail.co`,
                            pic: 'http://ghk.h-cdn.co/assets/16/09/980x490/landscape-1457107485-gettyimages-512366437.jpg'
                        }
                    });

                    if (ch){

                        ch.connect().then(
                            success=>{
                                cb();
                            },
                            fail => {
                                cb(fail);
                            }
                        );


                    } else {
                        return cb(new Error('cant create channel'));
                    }


                }
            });
        async.series(tasks,
            function (err, channels){
                try {
                    expect(err).to.be.null;
                    expect(channels).to.be.ok;
                    expect(channels).to.be.array;
                    expect(channels.length).to.equal(maxParallelConnections);

                    // lets check the first <<maxPushesPerDay>> push operations
                    for (let ch in (channels)) {
                        expect(ch).to.be.ok;
                    }

                    let i = maxParallelConnections + 1;


                    let ch = setup.client.channel({
                        channelName: testChanneName2,
                        key: app1._data.key,
                        secret: app1._data.secret,
                        user: {
                            username: `fronteroUUser555_${i}`,
                            email: `fronteroUUser555${i}@gmail.co`,
                            pic: 'http://ghk.h-cdn.co/assets/16/09/980x490/landscape-1457107485-gettyimages-512366437.jpg'
                        }
                    });

                    ch.connect().then(
                        success=> {
                            done(new Error('we are not supposed to be limited here!'));
                        },
                        fail => {
                            done();
                        }
                    );
                } catch (err){
                    done(err);
                }

            }
        );
    });


    after(function (done) {
        done();
    });


});