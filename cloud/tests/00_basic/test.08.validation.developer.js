
'use strict';

const expect = require('chai').expect;

describe("08. Developer validation",function(){

    let developer;

	before(function (done) {
		
		done();
	 });

    beforeEach(function(done) {
        global.setup.cleanCache(done);
    });

	it("check all parameters missing",function(done){
        developer = global.setup.teamClient.developer();

        developer.create({

        }).then((res) => { // success
                done(new Error('validation didnt work'));
            }, (err) => {
                expect(err.status).to.equal(422);
                done();
            });
    });

    it("check several parameters missing",function(done){
        developer = global.setup.teamClient.developer();

        developer.create({
            username: 'test01developer_username',
            password: 'test01developer_password'
        }).then((res) => { // success
            done(new Error('validation didnt work'));
        }, (err) => {
            expect(err.status).to.equal(422);
            done();
        });
    });

    it("check short username",function(done){
        developer = global.setup.teamClient.developer();

        developer.create({
            username: '12345',
            password: 'test01developer_password',
            email: 'good@gmail.com'
        }).then((res) => { // success
            done(new Error('validation didnt work'));
        }, (err) => {
            expect(err.status).to.equal(422);
            done();
        });
    });

    it("check bad email ",function(done){
        developer = global.setup.teamClient.developer();

        developer.create({
            username: '123456',
            password: 'test01developer_password',
            email: 'goodgmail.com'
        }).then((res) => { // success
            done(new Error('validation didnt work'));
        }, (err) => {
            expect(err.status).to.equal(422);
            done();
        });
    });

    after(function (done) {
        done();
    });

});