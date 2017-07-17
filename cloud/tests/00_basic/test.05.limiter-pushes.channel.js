
'use strict';

const expect = require('chai').expect;
const _ = require('underscore');
const async = require("async");

describe("05. (Pushes per Day per App) limits",function(){

    let testDeveloperSetup = {
        email: 'test04developer@frontero.com',
        username: 'test04developer_username',
        password: 'test04developer_password'
    };

    let testApp1Setup = {
        name: 'appTest04'
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

    let testChanneName = 'channelTestNews004';


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

    

    it("send more messages than allowed in a day and get denied",function(done){
        this.timeout(10000); // can be a long test

        // lets get the daily limitation
        let maxPushesPerDay = global.setup.serverConfig.limit.app.maxPushesPerDay;


        let commands = _.map(_.range(maxPushesPerDay), (i)=>{return `post #${i} on test#4`;});

        let pushCommandTasks = _.map(commands,
            (command)=>{
                return function pushAddTask(cb){
                    channel.send('push:add', command).then( push=>{
                        cb(false, push);
                    }, cb);
                }
            });
        async.series(pushCommandTasks,
            function (err, results){
                try {
                    expect(err).to.be.null;
                    expect(results).to.be.ok;
                    expect(results).to.be.array;
                    expect(results.length).to.equal(maxPushesPerDay);

                    // lets check the first <<maxPushesPerDay>> push operations
                    for (let pushRes in (results)) {
                        expect(pushRes).to.be.ok;
                    }

                    channel.send('push:add', 'this is the one too much').then(push=> {
                        done(new Error('this message should have not be allowed'));
                    }, err=>{
                        done(); // we are supposed to get error here!
                    });
                } catch (err){
                    done(err);
                }
            }
        );

        channel.on('err', function (err) {
            done(new Error(err));
        });
    });


    after(function (done) {
        done();
    });


});