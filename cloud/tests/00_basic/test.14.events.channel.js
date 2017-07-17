
'use strict';

const expect = require('chai').expect;
const _ = require('underscore');
const async = require('async');
import {TestSetup} from './../helpers/testSetup';
import {matchResultsVectors} from './../helpers/statics';

/**********************************************

 Channel Events Testing - API
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
    A1u1 adds/updates/deletes push on a1ch1 -
    make sure events are received by a1u1 and a1u2 on ch1 channel only


 Test logic:
    we collect a vector of results from each User/Channel connection
    and compare it to an expected vector of results with the function
    matchResultsVectors. Pass test if compare successful.

 **********************************************/


describe("14. Channel Events",function(){

    let d1Data = {
        email: 'test14_d1_developer@frontero.com',
        username: 'test14_d1_developer_username',
        password: 'test14_d1_developer_password'
    };

    let a1Data = {
        name: 'test14_a1'
    };

    let a2Data = {
        name: 'test14_a2'
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


    it("Push:added is received by other Users",async function(done){
        try{

            let expectedVector =
                [   { chKey: 'a1ch1u1', result: true },
                    { chKey: 'a1ch1u2', result: true },
                    { chKey: 'a1ch2u1', result: false },
                    { chKey: 'a1ch2u2', result: false },
                    { chKey: 'a2ch1u1', result: false },
                    { chKey: 'a2ch1u2', result: false },
                    { chKey: 'a2ch2u1', result: false },
                    { chKey: 'a2ch2u2', result: false } ];

            channels['a1ch1u1'].send('push:add', 'hello world').then( _push=>{
                push = _push; // is used later
            });

            async.map(Object.keys(channels),
                function (chKey, callback){
                    try {
                        let wasTriggered = false;

                        channels[chKey].on('push:added', (push)=> {
                            wasTriggered = true;
                            if (push) {
                                callback(null, {
                                    chKey: chKey,
                                    result: true
                                });
                            } else {
                                callback(new Error('push invalid'));
                            }
                        });

                        // if event didn't trigger, callback
                        setTimeout(()=> {
                            if (!wasTriggered) {
                                callback(null, {
                                    chKey: chKey,
                                    result: false
                                });
                            }
                        }, 1000);
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
                            done(new Error('results dont match expectations'))
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

    it("Push:edited is received by other Users",async function(done){
        try{

            let expectedVector =
                [   { chKey: 'a1ch1u1', result: true },
                    { chKey: 'a1ch1u2', result: true },
                    { chKey: 'a1ch2u1', result: false },
                    { chKey: 'a1ch2u2', result: false },
                    { chKey: 'a2ch1u1', result: false },
                    { chKey: 'a2ch1u2', result: false },
                    { chKey: 'a2ch2u1', result: false },
                    { chKey: 'a2ch2u2', result: false } ];

            channels['a1ch1u1'].send('push:edit', push);

            async.map(Object.keys(channels),
                function (chKey, callback){
                    try {
                        let wasTriggered = false;

                        channels[chKey].on('push:edited', (pushId)=> {
                            wasTriggered = true;
                            if (push) {
                                callback(null, {
                                    chKey: chKey,
                                    result: true
                                });
                            } else {
                                callback(new Error('push invalid'));
                            }
                        });

                        // if event didn't trigger, callback
                        setTimeout(()=> {
                            if (!wasTriggered) {
                                callback(null, {
                                    chKey: chKey,
                                    result: false
                                });
                            }
                        }, 1000);
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
                            done(new Error('results dont match expectations'))
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


    it("Push:deleted is received by other Users",async function(done){
        try{

            let expectedVector =
                [   { chKey: 'a1ch1u1', result: true },
                    { chKey: 'a1ch1u2', result: true },
                    { chKey: 'a1ch2u1', result: false },
                    { chKey: 'a1ch2u2', result: false },
                    { chKey: 'a2ch1u1', result: false },
                    { chKey: 'a2ch1u2', result: false },
                    { chKey: 'a2ch2u1', result: false },
                    { chKey: 'a2ch2u2', result: false } ];

            channels['a1ch1u1'].send('push:delete', push._id);

            async.map(Object.keys(channels),
                function (chKey, callback){
                    try {
                        let wasTriggered = false;

                        channels[chKey].on('push:deleted', (pushId)=> {
                            wasTriggered = true;
                            if (push) {
                                callback(null, {
                                    chKey: chKey,
                                    result: true
                                });
                            } else {
                                callback(new Error('push invalid'));
                            }
                        });

                        // if event didn't trigger, callback
                        setTimeout(()=> {
                            if (!wasTriggered) {
                                callback(null, {
                                    chKey: chKey,
                                    result: false
                                });
                            }
                        }, 1000);
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
                            done(new Error('results dont match expectations'))
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