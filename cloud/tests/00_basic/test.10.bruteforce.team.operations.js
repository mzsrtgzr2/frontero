
'use strict';

const expect = require('chai').expect;
const {runParallelBruteforceTest} = require('./../helpers/statics');

describe("10. Bruteforce team-api",function(){

    let developer;

    let testDeveloperSetup = {
        email: 'test09developer@frontero.com',
        username: 'test09developer_username',
        password: 'test09developer_password'
    };

    let testAppSetup = {
        name: 'appTest09'
    };

    let app;


    before(async function (done) {
        this.timeout(10000);

        await global.setup.teamClient.debug().set_bruteforce(true);

        global.setup.cleanCache(()=>{
            global.setup.setupNewApp(testDeveloperSetup, testAppSetup, (err, _app)=>{
                if (err){
                    done(err);
                } else {
                    app = _app; // save for later
                    done();
                }
            });
        });


	 });

    beforeEach(function(done) {
        global.setup.cleanCache(done);
    });

    it("attack with developer creation",function(done){

        this.timeout(10000);

        let developer = global.setup.teamClient.developer();
        let limit = global.setup.serverConfig.limit.bruteforce.teamCreations[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=> {
            developer.create({
                email: `test09_${i}_developer@frontero.com`,
                username: `test09_${i}_developer_username`,
                password: `test09_${i}_developer_password`
            }).then((res) => { // success
                callback(null, true);
            }, (err) => {
                callback(null, false);
            });
        };

        runParallelBruteforceTest(
            _oneSwingOfTheAttack,
            limit*3, // # size of the attack
            limit // expected to be allowed
        ).then(done, done);

    });

	it("attack with developer queries",function(done){

        this.timeout(10000);

        let developer = global.setup.teamClient.developer();
        let limit = global.setup.serverConfig.limit.bruteforce.teamQueries[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=> {
            developer.get().then((res) => { // success
                callback(null, true);
            }, (err) => {
                if (err.status==429){
                    callback(null, false);    
                } else {
                    callback(null, true); // any other error means we went through the protection    
                }
            });
        };

        runParallelBruteforceTest(
            _oneSwingOfTheAttack,
            limit*3, // # size of the attack
            limit // expected to be allowed
        ).then(done, done);

    });

    it("attack with developer changes",function(done){

        this.timeout(10000);
        
        let developer = global.setup.teamClient.developer();
        let limit = global.setup.serverConfig.limit.bruteforce.teamChanges[0].limit;

        let _oneSwingOfTheAttack = (i, callback)=> {
            developer.update({
                username: `test09developer_username${i}`,
            }).then((res) => { // success
                callback(null, true);
            }, (err) => {
                if (err.status==429){
                    callback(null, false);
                } else {
                    callback(null, true); // any other error means we went through the protection
                }
            });
        };

        runParallelBruteforceTest(
            _oneSwingOfTheAttack,
            limit*3, // # size of the attack
            limit // expected to be allowed
        ).then(done, done);

    });

    after(function (done) {
        done();
    });

});