
'use strict';

const expect = require('chai').expect;
const _ = require('underscore');
const async = require('async');
const faker = require('faker');
const json2csv = require('json2csv');
const fs = require('fs');
const Chance = require('chance');
const sleep = require('sleep');
var t = require("exectimer"),
    Tick = t.Tick;
const ipc=require('node-ipc');
const art = require('ascii-art');
const Docker = require('dockerode');
const stream = require('stream');
import {TestSetup} from './../helpers/testSetup';

//https://docs.docker.com/engine/reference/api/docker_remote_api_v1.24/

describe("01. Stress one App with many Connections",function(){

    const chance = new Chance();

    let dData = {
        email: faker.internet.email(),
        username: "1234" + faker.internet.domainWord(),
        password: "1234" + faker.internet.domainWord()
    };

    let aData = {
        name: 'test12_a1_' + faker.internet.domainWord()
    };

    let developer;
    let app;
    let combinations = [];

    var docker = new Docker({
        socketPath: '/var/run/docker.sock'
    });


    function getIPAddress() {
        var interfaces = require('os').networkInterfaces();
        for (var devName in interfaces) {
            var iface = interfaces[devName];

            for (var i = 0; i < iface.length; i++) {
                var alias = iface[i];
                if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal)
                    return alias.address;
            }
        }

        return '0.0.0.0';
    }

    function killAllZombieDockers (){
        // kill all zombie containers
        return new Promise (function (resolve, reject){
            art.font('clean dockers', 'Doom', 'white', function(rendered){
                console.log(rendered);
                docker.listContainers({
                    all: 1 // list also inactive containers
                }, function (err, containers) {
                    async.each(
                        containers,
                        function (containerInfo, cb){
                            // stop and remove
                            // each container that is 'zombie'

                            let name = containerInfo.Names[0];
                            if (name && name.startsWith('/zombie')) {
                                console.log(`removing container ${name}...`);
                                docker.getContainer(containerInfo.Id).stop(()=> {
                                        docker.getContainer(containerInfo.Id).remove(cb)
                                    });
                            } else {
                                //console.log(`keeping container ${name}`);
                                cb();
                            }
                        },
                        function (err, results){
                            console.log(`all dead`);
                            resolve();
                        });
                });
            });

        });
    }


    /**
     * Get logs from running container
     */
    function containerLogs(container) {

        // create a single stream for stdin and stdout
        var logStream = new stream.PassThrough();
        logStream.on('data', function(chunk){
            console.log(chunk.toString('utf8'));
        });

        container.logs({
            follow: true,
            stdout: true,
            stderr: true
        }, function(err, stream){
            if(err) {
                return logger.error(err.message);
            }
            container.modem.demuxStream(stream, logStream, logStream);
            stream.on('end', function(){
                logStream.end();
            });
        });
    }

    function createZombieDockers (combinations){
        // create all zombie containers
        return new Promise (function (resolve, reject){
            art.font('create dockers', 'Doom', 'magenta', function(rendered){
                console.log(rendered);

                let target = getIPAddress();
                async.map(
                    combinations,
                    function (combination, cb){

                        let cmd = `./node_modules/babel-cli/bin/babel-node.js ./src/zombie.js --interval 10 --zid ${combination.zid} --ch ${combination.channelName} --key ${combination.key} --secret ${combination.secret} --username ${combination.username} --email ${combination.email} --target http://${target}:3030`;

                        console.log (`running cmd ${cmd}`);

                        docker.createContainer({
                            Image: 'frontero_zombie',
                            Cmd: ['/bin/bash', '-c', cmd],
                            name: `zombie_${combination.zid}`
                        }, function (err, container) {
                            if (err){
                                console.error(err);
                                return cb(err);
                            }

                            container.start({}, function(err, data) {
                                if (err){
                                    console.error(err);
                                    return cb(err);
                                }
                                containerLogs(container);
                                cb();
                            });
                        });

                    },
                    function (err, results){
                        if (err){
                            console.error(err);
                            reject();
                        } else {
                            console.log(`${combinations.length} docker zombies are ready!`);
                            resolve();
                        }

                    });
            });


        });
    }

    before(async function (done){
        this.timeout(60000);

        await global.setup.teamClient.debug().set_bruteforce(false);
        await global.setup.teamClient.debug().set_app_limits(false);

        await killAllZombieDockers();

        try {
            developer = global.setup.teamClient.developer();

            await developer.create(dData);

            await global.setup.teamClient.authenticate({
                username: dData.username,
                password: dData.password
            });

            app = await developer.createApp(aData);

            let users = [];

            // create fake users
            for (let i=0; i<10; i++){
                users.push({
                    username: faker.internet.userName(),
                    email: faker.internet.email(),
                    pic: faker.image.imageUrl()
                });
            }

            let channels = [];
            // create fake channel names
            for (let i=0; i<3; i++){
                channels.push({
                    channelName: `channel_` + faker.lorem.word()
                });
            }

            // create all possible combinations
            let count = 0;

            for (let i=0; i<users.length; i++) {
                let user = users[i];
                for (let j = 0; j < channels.length; j++) {
                    let channelData = channels[j];

                    combinations.push({
                        zid: count++,
                        key: app.key,
                        secret: app.secret,
                        channelName: channelData.channelName,
                        username: user.username,
                        email: user.email,
                        pic: user.pic
                    });

                }
            }

            // map all these combinations to docker containers to run zombie
            await createZombieDockers(combinations);
            done();
        } catch (err) {
            done(err);
        }

    });

    beforeEach(async function (done) {

        done();
    });

    after(async function (done){

        this.timeout(60000);

        await killAllZombieDockers();


        done();
    });

    it("run stress test",async function(done){
        try{
            this.timeout(20*60*1000);

            setTimeout(()=>{
                done();
            }, 15*60*1000);

        } catch (err) {
            done(err);
        }
    });

});