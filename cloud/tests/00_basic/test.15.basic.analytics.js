
'use strict';

const expect = require('chai').expect;
const _ = require('underscore');

describe("15. Basic Analytics",function(){

    let testDeveloperSetup = {
        email: 'test16developer@frontero.com',
        username: 'test16developer_username',
        password: 'test16developer_password'
    };

    let testAppSetup = {
        name: 'appTest16'
    };

    let user1 = {
        username: 'fronteroUUser16',
        email: 'fronteroUUser16@gmail.co',
        pic: 'http://ghk.h-cdn.co/assets/16/09/980x490/landscape-1457107485-gettyimages-512366437.jpg'
    };

    let testChanneName = 'channelTestNews016';

    let developer;
    let app;
    let channel;
    let channel2;
    let push1;
    let push1_comment;
    let push1_comment_comment;

	before(function (done) {
        global.setup.setupNewApp(testDeveloperSetup, testAppSetup, async function (err, _app){
            if (err){
                done(err);
            } else {
                app = _app; // save for later

                channel = await global.setup.client.channel({
                    channelName: testChanneName,
                    key: app.key,
                    secret: app.secret,
                    user: user1
                }).connect();

                done();
            }
        });
	 });

    beforeEach(function(done) {
        global.setup.cleanCache(done);
    });

    
    /*
    * Analytics are reported every X seconds (w/ updateAnalytics)
    * here we test that the intervaled operation is functional
    * */
    it("send analytics",async function(done){

        try {
            await channel.updateAnalytics();
            done();
        } catch (e) {
            done(e);
        }

    });


    after(function (done) {
        done();
    });

});