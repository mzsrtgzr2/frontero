
'use strict';

const expect = require('chai').expect;

describe("01. Developer service",function(){

    let testDeveloperSetup = {
        email: 'test01developer@frontero.com',
        username: 'test01developer_username',
        password: 'test01developer_password'
    };

    let testDeveloperSetup2 = {
        email: 'test01developer2@frontero.com',
        username: 'test01developer2'
    };

    let developer;

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
                done(new Error(err));
            });
    });

    it("dont authenticate w/ bad credentials",function(done){
        global.setup.teamClient.authenticate({
            username: developer._data.username,
            password: 'fakePassword'
        }).then((res) => { // success
            done(new Error('wtf'));
        }, (err) => {
            done(); // expect rejection!
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

    it("get an existing developer",function(done){
        let developer2 = global.setup.teamClient.developer(developer._id);
        developer2.get()
            .then((res) => { // success
                try {
                    expect(res._id).to.equal(developer._id);
                    expect(res.username).to.equal(developer._data.username);
                    done();
                } catch (e) {
                    done(e);
                }
            }, (err) => {
                done(err);
            });
	
	});

    it("update an existing developer",function(done){
        let oldId = developer._id;
        developer.update(testDeveloperSetup2)
            .then((res) => { // success
                try {
                    expect(res._id).to.equal(oldId);
                    expect(res.username).to.equal(testDeveloperSetup2.username);
                    done();
                } catch (e) {
                    done(e);
                }
            }, (err) => {
                done(err)
            });
    });

    it("authenticate a developer (after changes)",function(done){
        // can we still authenticate after changing the account?
        global.setup.teamClient.authenticate({
            username: testDeveloperSetup2.username,
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

    after(function (done) {
        done();
    });

});