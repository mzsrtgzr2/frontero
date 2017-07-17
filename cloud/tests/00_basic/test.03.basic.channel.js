
'use strict';

const expect = require('chai').expect;
const _ = require('underscore');

describe("03. Channel socket",function(){

    let testDeveloperSetup = {
        email: 'test03developer@frontero.com',
        username: 'test03developer_username',
        password: 'test03developer_password'
    };

    let testAppSetup = {
        name: 'appTest03'
    };

    let user1 = {
        username: 'fronteroUUser1',
        email: 'fronteroUUser1@gmail.co',
        pic: 'http://ghk.h-cdn.co/assets/16/09/980x490/landscape-1457107485-gettyimages-512366437.jpg'
    };

    let user2 = {
        username: 'fronteroUUser2',
        email: 'fronteroUUser2@gmail.co',
        pic: 'http://www.maariv.co.il/download/pictures/%D7%9E%D7%9C%D7%9B%D7%AA%20%D7%90%D7%A0%D7%92%D7%9C%D7%99%D7%94%20%D7%94%D7%9E%D7%9C%D7%9B%D7%94%20%D7%90%D7%9C%D7%99%D7%96%D7%91%D7%AA%20480%20%D7%A8%D7%95%D7%99%D7%98%D7%A8%D7%A1.jpg'
    };

    let testChanneName = 'channelTestNews003';

    let developer;
    let app;
    let channel;
    let channel2;
    let push1;
    let push1_comment;
    let push1_comment_comment;

	before(function (done) {
        global.setup.cleanCache(done);

	 });

    beforeEach(function(done) {
        if (channel){
            channel.clearEvents();
        }

        if (channel2){
            channel2.clearEvents();
        }
        global.setup.cleanCache(done);
    });

    

    it("create a new developer",function(done){
        developer = global.setup.teamClient.developer();

        developer.create(testDeveloperSetup).then((res) => { // success
            try {
                expect(developer._id).to.be.ok;
                expect(developer._data).to.be.ok;
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

        developer.createApp(testAppSetup).then((_app) => { // success
                try {
                    app = _app;
                    expect(app.id).to.be.ok;
                    expect(app._data).to.be.ok;
                    expect(app.name).to.equal(testAppSetup.name.toLowerCase());
                    done();
                } catch (e) {
                    done(e);
                }
            }, (err) => {
                done(err);
            });
    });

    it("fail to login to a channel w/ bad credentials", async function(done){

        global.setup.createClient(); // we recreate the client, so all clean now

        try {
            channel = await global.setup.client.channel({
                    channelName: testChanneName,
                    key: app.key,
                    secret: app.secret +1,
                    user: user1
                }).connect();
            done(new Error('we are not supposed to authenticate w/ bad credentials'));

        } catch (err){
            done();
        }

    });

    it("login to a channel",async function(done){

        global.setup.createClient(); // we recreate the client, so all clean now

        try {
            channel = await global.setup.client.channel({
                channelName: testChanneName,
                key: app.key,
                secret: app.secret,
                user: user1
            }).connect();

            channel.on('disconnected', ()=>{
                done(new Error('disconnected'))
            });

            expect(channel.isConnected()).to.be.true;

            let appSocket = await global.setup.client.app({
                key: app.key,
                secret: app.secret,
                user: user1
            }).connect();

            let channels = await appSocket.send('channel:query', {});
            expect(channels).to.be.array;
            expect(channels.length).to.equal(1);

            expect(channel.isConnected()).to.be.true;


            done();
        } catch (err){
            done(err);
        }

    });

    it("push a message",function(done){
        channel.send('push:add', 'hello world').then( push=>{
            push1 = push;
            expect(push.payload.data.sys.type).to.equal('text');
            expect(push.userId).to.be.ok;
            expect(push.payload.data.sys.value).to.equal('hello world');
            done();
        }, err=>{
            done(err);
        });
    });

    it("push a message (with Channel event)",function(done){

        channel.send('push:add', 'hello world');

        channel.on('push:added', (push)=>{
            push1 = push;
            expect(push.payload.data.sys.type).to.equal('text');
            expect(push.userId).to.be.ok;
            expect(push.payload.data.sys.value).to.equal('hello world');
            done();
        });

    });

    it("get channel data",function(done) {
        channel.send('push:query', {}).then(pushes=> {
            expect(pushes).to.be.array;
            expect(pushes.length).to.equal(2);
            done();
        }, done);
    });

    it("push edit",function(done){
        var pushId = push1._id;
        push1.payload.data.sys.value = 'hello universe';

        channel.send('push:edit', push1).then( push=>{
            try {
                expect(push.payload.data.sys.type).to.equal('text');
                expect(push.payload.data.sys.value).to.equal('hello universe');
                expect(push._id).to.equal(pushId);
                expect(push.userId).to.be.ok;
                done();
            } catch (err){
                done(err);
            }

        }, done);

    });

    it("push edit (check channel event)",function(done){
        var pushId = push1._id;
        push1.payload.data.sys.value = 'hello universe';


        channel.send('push:edit', push1);

        channel.on('push:edited', function (push){
            expect(push.payload.data.sys.type).to.equal('text');
            expect(push.payload.data.sys.value).to.equal('hello universe');
            expect(push.userId).to.be.ok;
            expect(push._id).to.equal(pushId);
            done();
        });
    });

    it("comment",function(done){
        var parentId = push1._id;

        channel.send('push:add', {
            parentId: parentId,
            payload: 'thats my comment'
        }).then(push=>{
            expect(push).to.be.ok;
            expect(push.parent).to.be.ok;
            expect(push.userId).to.be.ok;
            push1_comment = push;
            done();
        }, done);

    });

    it("comment the comment",function(done){
        var parentId = push1_comment._id;

        channel.send('push:add', {
            parentId: parentId,
            payload: 'thats my comment on that comment'
        }).then( (push)=>{
            push1_comment_comment = push;
            expect(push).to.be.ok;
            expect(push.parent).to.be.ok;
            expect(push.userId).to.be.ok;
            done();
        }, done);
    });

    it("get channel data w/o comments",function(done){
        channel.send('push:query', {}).then( pushes=>{

            expect(pushes).to.be.array;
            expect(pushes.length).to.equal(2);
            done();
        }, done);
    });

    it("delete the push w/ all its comments",function(done){
        channel.send('push:delete', push1._id).then( (pushId)=>{

            expect(pushId).to.be.ok;
            done();

        }, done);
    });

    it("push bad format",function(done){
        channel.send('push:add', ["lolo"]).then( (push)=>{
            done(new Error('bad format was accepted'));
        }, err=>{
            done();
        });
    });
    

    it("get users (1 user)",function(done){
        channel.send('user:query', {}).then( users=>{
            expect(users).to.be.array;
            expect(users.length).to.equal(1);
            done();
        }, done);
    });

    it("send bulk Pushes",function(done){
        // lets add 3 Pushes
        channel.send('bulk',
            _.map(['helo1', 'helo2', 'helo3'], (d)=>{return {type: 'push:add', data: d}})
        ).then(
            addedPushes=>{
                expect(addedPushes).to.be.array;
                expect(addedPushes.length).to.be.equal(3);

                // now lets delete them
                channel.send('bulk',
                    _.map(addedPushes, (p)=>{return {type: 'push:delete', data: p._id}})
                ).then(removedPushes=>{
                        expect(removedPushes).to.be.array;
                        expect(removedPushes.length).to.be.equal(3);

                        done();
                    }, done);
            }, done);
    });

    it("login another user", async function(done){

        global.setup.createClient(); // we recreate the client, so all clean now

        try {
            channel2 = await global.setup.client.channel({
                channelName: testChanneName,
                key: app.key,
                secret: app.secret,
                user: user2
            }).connect();

            done();
        }catch (err){
            done(err);
        }

    });

    it("2nd User pushs a message",function(done){
        channel2.send('push:add', 'hello galaxy').then(push=>{
            expect(push.payload.data.sys.type).to.equal('text');
            expect(push.userId).to.be.ok;
            expect(push.payload.data.sys.value).to.equal('hello galaxy');
            done();
        }, done);

    });

    it("get users (2 users)",function(done){
        channel.send('user:query', {}).then(users=>{
            expect(users).to.be.array;
            expect(users.length).to.equal(2);
            done();
        }, done);

    });

    it("users pagination",function(done) {
        // we have 2 users in db
        // we offset in 1 so we should
        // get only 1 user
        channel.send('user:query', {
            offset:1
        }).then (users=>{
            expect(users).to.be.array;
            expect(users.length).to.equal(1);
            done();

        }, done);

    });

    it("pushes pagination",function(done) {

        let postsTexts = [  'post #1 9D6ZPCzrV',
                            'post #2 wHB6Kmi6r',
                            'post #3 s3qRMB4Cr'];

        channel.send('bulk',
            _.map(postsTexts, (d)=>{return {type: 'push:add', data: d}})
        ).then(addedPushes=>{
                expect(addedPushes).to.be.array;
                expect(addedPushes.length).to.be.equal(3);
                expect(addedPushes[0].payload.data.sys.value).to.equal(postsTexts[0]);
                expect(addedPushes[1].payload.data.sys.value).to.equal(postsTexts[1]);
                expect(addedPushes[2].payload.data.sys.value).to.equal(postsTexts[2]);

                channel.send('push:query', {
                    limit: 1
                }).then(pushes=>{
                    expect(pushes).to.be.array;
                    expect(pushes.length).to.equal(1);
                    // first Push we get in query should be the latest we sent (3rd sent Push)
                    expect(pushes[0].payload.data.sys.value).to.equal(postsTexts[2]);
                    channel.send('push:query', {
                        offset: 1,
                        limit: 2
                    }).then( pushes=>{
                        expect(pushes).to.be.array;
                        expect(pushes.length).to.equal(2);
                        // same logic as before
                        expect(pushes[0].payload.data.sys.value).to.equal(postsTexts[1]);
                        expect(pushes[1].payload.data.sys.value).to.equal(postsTexts[0]);
                        done();
                    }, done);
                }, done);
            }, done);
    });

    it("list apps", async function(done){
        try {
            let app1 = await developer.createApp({name: 'appTest03_1'});
            let app2 = await developer.createApp({name: 'appTest03_2'});
            let apps = await developer.getApps()
            expect(apps).to.be.array;
            expect(apps.length).to.be.above(2);
            done();
        } catch (err) {
            done(err);
        };
    });

    after(function (done) {
        done();
    });

});