
'use strict';

const expect = require('chai').expect;
const _ = require('underscore');
const async = require('async');
import {TestSetup} from './../helpers/testSetup';
import {matchResultsVectors} from './../helpers/statics';

/**********************************************

 User Privacy Testing
 ----------------------------

 Setup:
 We have one developer: d1

 This developer created two Apps:
 D1 created app a1
 D1 created app a2

 We have two users that are using both Apps - u1 and u2:
 We have User under a1 called a1u1
 We have User under a1 called a1u2
 We have User under a2 called a2u1
 We have User under a2 called a2u2

 Every App has two Channels:
 We have Channel under a1 called a1ch1
 We have Channel under a1 called a1ch2
 We have Channel under a2 called a2ch1
 We have Channel under a2 called a2ch2

 And every user connected to each of the Channels:
 User a1u1 connected to a1ch1
 User a1u1 connected to a1ch2
 User a1u2 connected to a1ch1
 User a1u2 connected to a1ch2
 User a2u1 connected to a2ch1
 User a2u1 connected to a2ch2
 User a2u2 connected to a2ch1
 User a2u2 connected to a2ch2


 Tests:
 We want to make sure that after User1 pushes to Ch1 on App1
 no one expect this User on this Channel can edit or delete this push



 **********************************************/


describe("13. User Privacy",function(){

    let d1Data = {
        email: 'test13_d1_developer@frontero.com',
        username: 'test13_d1_developer_username',
        password: 'test13_d1_developer_password'
    };

    let a1Data = {
        name: 'test13_a1'
    };

    let a2Data = {
        name: 'test13_a2'
    };

    let channelsData = {
        a1ch1: 'channel_a1ch1',
        a1ch2: 'channel_a1ch2',
        a2ch1: 'channel_a2ch1',
        a2ch2: 'channel_a2ch2'
    }

    let usersData = {
        a1u1: {
            username: 'fronteroUUser_a1u1',
            email: 'fronteroUUser_a1u1@gmail.co'
        },
        a1u2: {
            username: 'fronteroUUser_a1u2',
            email: 'fronteroUUser_a1u2@gmail.co'
        },
        a2u1: {
            username: 'fronteroUUser_a2u1',
            email: 'fronteroUUser_a2u1@gmail.co'
        },
        a2u2: {
            username: 'fronteroUUser_a2u2',
            email: 'fronteroUUser_a2u2@gmail.co'
        }
    };


    let setups = [];
    let channels = [];
    let d1;
    let a1,a2;
    let push;

    before(async function (done){
        try {
            global.setup.cleanCache();
            d1 = global.setup.teamClient.developer();
            await d1.create(d1Data);

            await global.setup.teamClient.authenticate({
                username: d1Data.username,
                password: d1Data.password
            });

            a1 = await d1.createApp(a1Data);
            a2 = await d1.createApp(a2Data);

            setups['u1'] = new TestSetup(false/*no server setup*/);
            setups['u2'] = new TestSetup(false/*no server setup*/);


            channels['a1ch1u1'] = await setups['u1'].client.channel({
                channelName: channelsData.a1ch1,
                key: a1.key,
                secret: a1.secret,
                user: usersData.a1u1
            }).connect();

            channels['a1ch1u2'] = await setups['u2'].client.channel({
                channelName: channelsData.a1ch1,
                key: a1.key,
                secret: a1.secret,
                user: usersData.a1u2
            }).connect();

            channels['a1ch2u1'] = await setups['u1'].client.channel({
                channelName: channelsData.a1ch2,
                key: a1.key,
                secret: a1.secret,
                user: usersData.a1u1
            }).connect();

            channels['a1ch2u2'] = await setups['u2'].client.channel({
                channelName: channelsData.a1ch2,
                key: a1.key,
                secret: a1.secret,
                user: usersData.a1u2
            }).connect();

            channels['a2ch1u1'] = await setups['u1'].client.channel({
                channelName: channelsData.a2ch1,
                key: a2.key,
                secret: a2.secret,
                user: usersData.a2u1
            }).connect();

            channels['a2ch1u2'] = await setups['u2'].client.channel({
                channelName: channelsData.a2ch1,
                key: a2.key,
                secret: a2.secret,
                user: usersData.a2u2
            }).connect();

            channels['a2ch2u1'] = await setups['u1'].client.channel({
                channelName: channelsData.a2ch2,
                key: a2.key,
                secret: a2.secret,
                user: usersData.a2u1
            }).connect();

            channels['a2ch2u2'] = await setups['u2'].client.channel({
                channelName: channelsData.a2ch2,
                key: a2.key,
                secret: a2.secret,
                user: usersData.a2u2
            }).connect();

            push = await channels['a1ch1u1'].send('push:add', 'hello world');

            done();

        }catch (err){
            done(err);
        }
    });

    beforeEach(async function (done) {
        _.each (channels, async function (ch){
            ch.clearEvents();
        });
        done();
    });

    after(async function (done){
        _.each (channels, async function (ch){
            ch.disconnect();
        });

        _.each(setups, async function (setup){
            await setup.kill();
        });
        done();
    });


    it("Push:edit is blocked by other Users",async function(done){
        try{

            let expectedVector =
                [   { chKey: 'a1ch1u1', result: true},
                    { chKey: 'a1ch1u2', result: false },
                    { chKey: 'a1ch2u1', result: false },
                    { chKey: 'a1ch2u2', result: false },
                    { chKey: 'a2ch1u1', result: false },
                    { chKey: 'a2ch1u2', result: false },
                    { chKey: 'a2ch2u1', result: false },
                    { chKey: 'a2ch2u2', result: false } ];

            async.map(Object.keys(channels),
                function (chKey, callback){
                    try {
                        channels[chKey].send('push:edit', push)
                            .then(push=> {
                                callback(null, {
                                    chKey: chKey,
                                    result: true
                                });
                            }, err=>{
                                callback(null, {
                                    chKey: chKey,
                                    result: false
                                });
                            });

                    } catch (err){
                        callback(err);
                    }
                },
                async function (err, results){
                    try{
                        if (err){
                            return done(err);
                        }

                        if (matchResultsVectors(results,expectedVector,'chKey','result')){
                            done();
                        } else {
                            done(new Error(`results don't match expectations`));
                        }
                    }catch(err){
                        done(err);
                    }
                }
            );

        } catch (err) {
            done(err);
        }
    });

    it("Push:delete is blocked by other Users",async function(done){
        try{

            let expectedVector =
                [   { chKey: 'a1ch1u1', result: true},
                    { chKey: 'a1ch1u2', result: false },
                    { chKey: 'a1ch2u1', result: false },
                    { chKey: 'a1ch2u2', result: false },
                    { chKey: 'a2ch1u1', result: false },
                    { chKey: 'a2ch1u2', result: false },
                    { chKey: 'a2ch2u1', result: false },
                    { chKey: 'a2ch2u2', result: false } ];

            async.map(Object.keys(channels),
                function (chKey, callback){
                    try {
                        channels[chKey].send('push:delete', push._id)
                            .then(pushId=> {
                                callback(null, {
                                    chKey: chKey,
                                    result: true
                                });
                            }, err=>{
                                callback(null, {
                                    chKey: chKey,
                                    result: false
                                });
                            });

                    } catch (err){
                        callback(err);
                    }
                },
                async function (err, results){
                    try{
                        if (err){
                            return done(err);
                        }

                        if (matchResultsVectors(results,expectedVector,'chKey','result')){
                            done();
                        } else {
                            done(new Error(`results don't match expectations`));
                        }
                    }catch(err){
                        done(err);
                    }
                }
            );

        } catch (err) {
            done(err);
        }
    });

});