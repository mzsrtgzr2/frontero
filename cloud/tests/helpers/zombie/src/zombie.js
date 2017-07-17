const {FronteroCore} = require("../../clientlib/src/fronteroCore");
const program = require('commander');
const art = require('ascii-art');
const _ = require('underscore');
const async = require('async');
const faker = require('faker');
const Chance = require('chance');
const CronJob = require('cron').CronJob;

// http://stackoverflow.com/questions/34374730/communication-between-n-node-js-processes

program
    .option('-t, --target [value]', 'target endpoint')
    .option('-z, --zid [value]', 'zombie id')
    .option('-c, --ch [value]', 'channel name')
    .option('-k, --key [value]', 'app key')
    .option('-s, --secret [value]', 'app secret')
    .option('-u, --username [value]', 'user name')
    .option('-e, --email [value]', 'user email')
    .option('-i, --interval [value]', 'sending intervals')
    .parse(process.argv);


let client;
let channel1;
let channel2;
let channel3;

const chance = new Chance();

async function start (int = 2){
    try {
        let delta =  (int);
        let interval = parseInt(int + chance.integer({min: -delta, max: delta}));
        interval = Math.max(interval, 1);
        console.log(`starting at interval of ${interval} s`)
        let job = new CronJob({
            cronTime: `*/${interval} * * * * *`, // every 5 seconds
            onTick: async function (){
                if (channel1 && channel1.isConnected()){


                    setTimeout (async function (){
                        try{
                            console.log('sending new push...')
                            let push = await channel1.send('push:add', faker.lorem.sentence());

                            console.log('query pushes...')
                            let pushes = await channel1.send('push:query');

                            console.log('editing push...')
                            let edited = await channel1.send('push:edit', push);
                        } catch (err){
                            console.error(err);
                        }
                    }, chance.integer({min: 100, max: 6000}));

                } else {
                    console.error('died')
                    process.exit(1); //exit w/ error
                }

                if (channel2 && channel2.isConnected()){

                    setTimeout (async function (){
                        try{
                            console.log('sending new push...')
                            let push = await channel2.send('push:add', faker.lorem.sentence());

                            console.log('query pushes...')
                            let pushes = await channel2.send('push:query');

                            console.log('editing push...')
                            let edited = await channel2.send('push:edit', push);
                        } catch (err){
                            console.error(err);
                        }
                    }, chance.integer({min: 100, max: 6000}));

                } else {
                    console.error('died')
                    process.exit(1); //exit w/ error
                }

                if (channel3 && channel3.isConnected()){

                    setTimeout (async function (){
                        try{
                            console.log('sending new push...')
                            let push = await channel3.send('push:add', faker.lorem.sentence());

                            console.log('query pushes...')
                            let pushes = await channel3.send('push:query');

                            console.log('editing push...')
                            let edited = await channel3.send('push:edit', push);
                        } catch (err){
                            console.error(err);
                        }
                    }, chance.integer({min: 100, max: 6000}));

                } else {
                    console.error('died')
                    process.exit(1); //exit w/ error
                }
            },
            start: true
        });

    } catch ( err ){
        //console.error (err);
        console.error('died')
        process.exit(1); //exit w/ error
    }
}

async function init (endPoint = 'http://localhost:3030') {
    try {
        console.log('creating FronteroCore instance...')
        client = new FronteroCore({
            endPoint: endPoint,
            analyticsReporting: true
        });

        console.log('creating channel...')

        channel1 = await client.channel({
            channelName: program.ch,
            key: program.key,
            secret: program.secret,
            user: {
                username: program.username,
                email: program.email
            }
        }).connect();

        channel2 = await client.channel({
            channelName: program.ch + '1',
            key: program.key,
            secret: program.secret,
            user: {
                username: '_' + program.username,
                email: '_' + program.email
            }
        }).connect();

        channel3 = await client.channel({
            channelName: program.ch + '2',
            key: program.key,
            secret: program.secret,
            user: {
                username: '__' + program.username,
                email: '__' + program.email
            }
        }).connect();

    } catch (err){
        console.log('failed to connect')
        console.error(err);
    }

    try {
        setTimeout (async function (){
            try{
                start(parseInt(program.interval || 2));
            } catch (err){
                console.error(err);
            }
        }, chance.integer({min: 0, max: 60000}));

    } catch (err){
        console.log('failed to start')
        console.error(err);
    }

}

art.font('Fr', 'Doom', 'magenta').font('Zombie', 'Doom', 'red').font('Slave', 'Doom', 'magenta', function(rendered){
    console.log(rendered);
    console.log(`i'm zombie #${program.zid}`);
    console.log(`channel ${program.ch}`);
    console.log(`key ${program.key}`);
    console.log(`secret ${program.secret}`);
    console.log(`username ${program.username}`);
    console.log(`email ${program.email}`);
    try {
        setTimeout (async function (){
            try{
                init(program.target);
            } catch (err){
                console.error(err);
            }
        }, chance.integer({min: 0, max: 60000}));

    } catch (err){
        console.log('failed to init')
        console.error(err);
    }
});