/**
 * Created by mosherot on 6/15/16.
 */

'use strict';

const quote = require('prog-quote');

describe("That's all folkes",function() {

    it("bye ",function(done){
        let q = quote.quotes();
        
        done();
    });

    after(async function (done) {
        await global.setup.teamClient.debug().set_bruteforce(false);
        await global.setup.teamClient.debug().set_app_limits(false);

        global.setup.kill().then(done, done);
    });
});