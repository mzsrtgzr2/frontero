require('datejs');
const App = require('../../shared/models/app');
const Channel = require('../../shared/models/channel');
const User = require('../../shared/models/user');
const Push = require('../../shared/models/push');
const _ = require('underscore');
const async = require("async");


// ===============================================================
// ======================///~~~ ARCHIVER ~~~///===================
// ===============================================================

module.exports.getState = function getState(logger, config, sockManager){
    return new Promise (async function (resolve, reject){
        try {
            let totalNumOfApps = await App.count().exec();
            let totalNumOfPushes = await Push.count().exec();
            let totalNumOfChannels = await Channel.count().exec();
            let totalNumOfUsers = await User.count().exec();
            let totalNumOfSockets = sockManager.getTotal();

            resolve({
                totalNumOfApps: totalNumOfApps,
                totalNumOfPushes: totalNumOfPushes,
                totalNumOfChannels: totalNumOfChannels,
                totalNumOfUsers: totalNumOfUsers,
                totalNumOfSockets: totalNumOfSockets
            });
        }catch(err){
            reject(err);
        }
    });
};