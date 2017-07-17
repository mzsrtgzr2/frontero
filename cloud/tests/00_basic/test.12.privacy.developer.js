
'use strict';

const expect = require('chai').expect;
const _ = require('underscore');
const async = require('async');
import {TestSetup} from './../helpers/testSetup';

/**********************************************

 We have two developers: d1 and d2
 D1 created app a1
 D2 created app a2

 tests:
 D1 can’t get d2 information
 D1 can’t change d2 information
 D1 can’t delete d2
 D1 can’t get a2
 D1 can’t change a2
 D1 can’t delete a2

 **********************************************/


describe("12. Developer Privacy",function(){

    let d1Data = {
        email: 'test12_d1_developer@frontero.com',
        username: 'test12_d1_developer_username',
        password: 'test12_d1_developer_password'
    };

    let d2Data = {
        email: 'test12_d2_developer@frontero.com',
        username: 'test12_d2_developer_username',
        password: 'test12_d2_developer_password'
    };

    let a1Data = {
        name: 'test12_a1'
    };

    let a2Data = {
        name: 'test12_a2'
    };

    let setup1, setup2;
    let d1,d2;
    let a1,a2;

    beforeEach(function (done) {
        let _setupD1 = async function (cb){
            try {
                setup1 = new TestSetup(false/*no server setup*/);
                d1 = setup1.teamClient.developer();

                await d1.create(d1Data);

                await setup1.teamClient.authenticate({
                            username: d1Data.username,
                            password: d1Data.password
                        });

                a1 = await d1.createApp(a1Data);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        let _setupD2 = async function (cb){
            try {
                setup2 = new TestSetup(false/*no server setup*/);
                d2 = setup2.teamClient.developer();

                await d2.create(d2Data);

                await setup2.teamClient.authenticate({
                    username: d2Data.username,
                    password: d2Data.password
                });

                a2 = await d2.createApp(a2Data);
                cb();
            } catch (e) {
                cb(e);
            }
        };

        global.setup.clean(()=>{
            async.series([_setupD1, _setupD2],
                function (err){
                    try {
                        expect(err).to.be.null;
                        done();
                    } catch (err){
                        done(err);
                    }
                }
            );

        });
    });

    afterEach(async function (done) {
        try {
            await setup1.kill();
            await setup2.kill();
            done();
        } catch (err){
            done(err);
        }
    });


    it("d1 can’t get d2 information",async function(done){
        try{
            d1._id = d2._id; // override id, d1 will try to impersonate d2
            let _d2HijackedData = await d1.get();
            done(new Error('should not be able to hijack data'));
        } catch (err) {
            done();
        }
    });


    it("d1 can’t change d2 information",async function(done){
        try{
            d1._id = d2._id; // override id, d1 will try to impersonate d2
            let _d2HijackedData = await d1.update({
                username: 'new_name_for_d2_i_choose',
            });
            done(new Error('should not be able to hijack data'));
        } catch (err) {
            done();
        }
    });

    it("d1 can’t delete d2 information",async function(done){
        try{
            d1._id = d2._id; // override id, d1 will try to impersonate d2
            let _d2HijackedData = await d1.delete();
            done(new Error('should not be able to hijack data'));
        } catch (err) {
            done();
        }
    });

    it("d1 can’t get a2 (d2 app)",async function(done){
        try{
            a1._id = a2.id;
            let _d2HijackedData = await a1.get();
            done(new Error('should not be able to hijack data'));
        } catch (err) {
            done();
        }
    });

    it("d1 can’t change a2 (d2 app)",async function(done){
        try{
            a1._id = a2.id;
            let _d2HijackedData = await a1.update({
                name: 'new_app_name_i_choose'
            });
            done(new Error('should not be able to hijack data'));
        } catch (err) {
            done();
        }
    });

    it("d1 can’t delete a2 (d2 app)",async function(done){
        try{
            a1._id = a2.id;
            let _d2HijackedData = await a1.delete();
            done(new Error('should not be able to hijack data'));
        } catch (err) {
            done();
        }
    });

});