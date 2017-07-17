
'use strict';

const expect = require('chai').expect;
import {TestSetup} from './../helpers/testSetup';

describe("02. App service",function(){

    let testDeveloperSetup = {
        email: 'test02developer@frontero.com',
        username: 'test02developer_username',
        password: 'test02developer_password'
    };

    let testAppSetup = {
        name: 'appTest02'
    };

    let user1 = {
        username: 'fronteroUUser1',
        email: 'fronteroUUser1@gmail.co',
        pic: 'http://ghk.h-cdn.co/assets/16/09/980x490/landscape-1457107485-gettyimages-512366437.jpg'
    };

    let developer;
    let app;

	before(function (done) {
		
		done();
	 });

    beforeEach(function(done) {
        global.setup.cleanCache(done);
    });

    it("create a new developer",function(done){
        developer = global.setup.teamClient.developer();

        developer.create(testDeveloperSetup).then((res) => { // success
            try {
                expect(developer._id).to.be.ok;
                expect(developer._data).to.be.valid;
                expect(developer._data.username).to.equal(testDeveloperSetup.username);
                expect(res.username).to.equal(testDeveloperSetup.username);
                done();
            } catch (e) {
                done(e);
            }
        }, (err) => {
            done(err);
        });
    });

    it("authenticate a developer",function(done){
        global.setup.teamClient.authenticate({
            username: testDeveloperSetup.username,
            password: testDeveloperSetup.password
        }).then((res) => { // success
            try {
                expect(res).to.be.ok;
                done();
            } catch (e) {
                done(e);
            }
        }, (err) => {
            done(err);
        });

    });

	it("create a new app",function(done){

        developer.createApp(testAppSetup).then((res) => { // success
                try {
                    app = res;
                    expect(app.id).to.be.ok;
                    expect(app.name).to.equal(testAppSetup.name.toLowerCase());
                    expect(app.key).to.be.valid;
                    expect(app.secret).to.be.valid;
                    done();
                } catch (e) {
                    done(e);
                }
            }, (err) => {
                done(new Error('wtf'));
            });
    });

    it("update an new app",async function(done){
        try {
            await app.update({
                name: 'appTest02_new_name'
            });
            done();
        } catch (err) {
            done (err);
        }
    });

    it("regenerate secret",async function(done){
        try {
            let newSecret = await app.regenerateSecret();
            expect(newSecret).to.be.valid;
            done();
        } catch (err) {
            done (err);
        }
    });


    it("delete an app",async function(done){
        try{
            let appId = app.id;
            await app.delete();

            try {
                // this should fail! app doesn't exist any more
                app._id = appId;
                await app.get();
                done(new Error(
                    'how deleted App still exists?'
                ));
            } catch (err){
                done();
            }
            
        } catch (err){

            done (err);
        }
    });

    it("connect to an app socket as a User",async function(done){
        try {

            // recreate the app because we deleted it earlier

            let app = await developer.createApp(testAppSetup)

            expect(app.id).to.be.ok;
            expect(app.name).to.equal(testAppSetup.name.toLowerCase());
            expect(app.key).to.be.valid;
            expect(app.secret).to.be.valid;


            // now lets query what channels we have
            let appSocket = await global.setup.client.app({
                key: app.key,
                secret: app.secret,
                user: user1
            }).connect();

            let channels = await appSocket.send('channel:query', {});
            expect(channels).to.be.array;
            expect(channels.length).to.equal(0); // no channels yet on this app



            done();


        } catch (e) {
            done(e);
        }
    });


    after(function (done) {
        done();
    });

});