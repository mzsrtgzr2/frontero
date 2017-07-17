
'use strict';

const expect = require('chai').expect;
const _ = require('underscore');
const async = require("async");

describe("07. Archiving Old Pushes",function(){

    let testDeveloperSetup = {
        email: 'test_06developer@frontero.com',
        username: 'test_06developer_username',
        password: 'test_06developer_password'
    };

    let testApp1Setup = {
        name: 'appTest06'
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

    let testChanneName = 'channelTestNews006';


    let app1;
    let channel;

    before(function (done) {

        global.setup.cleanCache(() => {
            /////~~~ SETUP DEVELOPER+APP+CHANNEL ~~~///
            global.setup.setupNewApp(testDeveloperSetup, testApp1Setup, (err, _app)=> {
                if (err) {
                    done(err);
                } else {
                    app1 = _app; // save for later

                    global.setup.createClient(); // we recreate the client, so all clean now

                    channel = global.setup.client.channel({
                        channelName: testChanneName,
                        key: app1._data.key,
                        secret: app1._data.secret,
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
        if (channel){
            channel.clearEvents();
        }
        global.setup.cleanCache(done);
    });

    it("archive old messages",function(done){
        this.timeout(20000); // can be a long test

        let maxArchivedPosts = global.setup.serverConfig.limit.app.maxArchivedPosts;
        let todayNumOfPosts = maxArchivedPosts*2;
        
        channel.send('bulk',
            _.map(_.range(todayNumOfPosts), (i)=>{return {type: 'push:add', data: `push ${i}`}})
        ).then (
            addedPushes=>{
                // make sure we got all the posts uploaded
                expect(addedPushes).to.be.array;
                expect(addedPushes.length).to.be.equal(todayNumOfPosts);

                // ask server to do ARCHIVE operation
                global.setup.teamClient.debug().archive().then(()=>{

                    // after ARCHIVE, let query all the pushes in the channel
                    // and make sure that the oldest got archived
                    channel.send('push:query',{
                        offset: 0,
                        limit: 99999999 // infinity
                    }).then (pushes => {
                        expect(pushes).to.be.array;
                        expect(pushes.length).to.be.equal(maxArchivedPosts);
                        done();
                    }, done);
                });
            }, done);

    });


    after(function (done) {
        done();
    });


});