const async = require('async');
const _ = require('underscore');
const expect = require('chai').expect;

// fnOneAttackAction - should call callback(false, result)
//      result should be true if the call was allowed and false if blocked

export function runParallelBruteforceTest (fnOneAttackAction, attackCount = 100, expectedToBeAllowed = 100) {
    return new Promise( (resolve, reject) => {
        async.map(_.range(attackCount),
            fnOneAttackAction,
            function (err, results){
                if (err){
                    return reject(`test failed badly: ${err}`);
                }

                let blockedResults = _.filter(results, (result)=>{
                    return result == false;
                });

                let notBlockedResults = _.filter(results, (result)=>{
                    return result == true;
                });

                let result = {
                    countProtected: blockedResults.length, // counts what was protected/limited/blocked by bf-protection
                    countPassthrough: notBlockedResults.length // counts what was NOT protected
                };

                console.log(`passed: ${result.countPassthrough} / protected ${result.countProtected}`);

                try{
                    // the configuration defined the set of rules for bucket-window
                    // the limit variable means how many we allow to pass through in a window
                    expect(result.countPassthrough).to.be.below(parseInt(expectedToBeAllowed*1.3)); //check we allowed not more than 'limit'
                    expect(result.countPassthrough).to.be.above(0); //check we allowed something...

                    // no request shoud have succeeded (authentication success)
                    expect(result.countPassthrough+result.countProtected).to.be.equal(attackCount);

                    resolve();
                } catch (excp){
                    return reject(`test failed badly: ${excp}`);
                }
            }
        );
    });
};


export function runSeriesBruteforceTest (fnOneAttackAction, attackCount = 100, expectedToBeAllowed = 100) {
    return new Promise( (resolve, reject) => {

        let tasks = _.map(_.range(attackCount), (i)=>{
                return fnOneAttackAction.bind(this, i);
            });

        async.series(tasks,
            function (err, results){
                try {
                    if (err){
                        return reject(`test failed badly: ${err}`);
                    }

                    let blockedResults = _.filter(results, (result)=>{
                        return result == false;
                    });

                    let notBlockedResults = _.filter(results, (result)=>{
                        return result == true;
                    });

                    let result = {
                        countProtected: blockedResults.length, // counts what was protected/limited/blocked by bf-protection
                        countPassthrough: notBlockedResults.length // counts what was NOT protected
                    };

                    console.log(`passed: ${result.countPassthrough} / protected ${result.countProtected}`);

                    // the configuration defined the set of rules for bucket-window
                    // the limit variable means how many we allow to pass through in a window
                    expect(result.countPassthrough).to.be.below(expectedToBeAllowed+1); //check we allowed not more than 'limit'
                    expect(result.countPassthrough).to.be.above(0); //check we allowed something...

                    // no request shoud have succeeded (authentication success)
                    expect(result.countPassthrough+result.countProtected).to.be.equal(attackCount);

                    resolve();
                } catch (excep){
                    return reject(`test failed badly: ${excep}`);
                }

            }
        );

    });
};

//
// we have two arrays that contain objects in some unordered manner
// these objects have two fields:
// sortField and resultField
//
// First, we sort the arrays according to sortField
// than we extract the resultField values
// and last, we compare the results value-by-value to make sure
// they match

export function matchResultsVectors (v1, v2, sortField, resultField){
    if (v1.length!=v2.length){
        return false;
    }

    let sv1 = _.sortBy(v1, a=>{return a[sortField];});
    let sv2 = _.sortBy(v2, a=>{return a[sortField];});

    let values1 = _.map(sv1, a=>{return a[resultField];});
    let values2 = _.map(sv2, a=>{return a[resultField];});

    for (let i=0; i< values1.length; i++){
        if (values1[i]!=values2[i]){
            return false;
        }
    }
    return true; // compare is ok
}