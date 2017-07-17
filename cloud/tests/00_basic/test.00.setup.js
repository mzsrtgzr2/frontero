/**
 * Created by mosherot on 6/15/16.
 */

'use strict';

import {TestSetup} from './../helpers/testSetup';

describe("Setup",function(){

    before(function (done) {
        this.timeout(10000);
        global.setup = new TestSetup();
        global.setup.start();
        setTimeout(()=>{
            global.setup.clean(done);
        }, 1000);

    });



    it("do nothing for setup sake",function(done){
        done();
    });


    after(function (done) {
        done()
    });

});