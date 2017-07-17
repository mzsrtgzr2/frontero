/**
 * Created by mosherot on 6/29/16.
 */
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

module.exports.archive = function archive(logger, config, cb){
    let today = Date.today();

    // ~~~ FIND APPS THAT WERE UPDATED TODAY
    App.find({
        updatedAt: {
            "$gte": today
        }
    }).exec((err, apps)=>{
        if (err) {
            console.error('failed to get apps');
        } else {
            logger.debug(`[Archiver] Inspecting ${apps.length} Apps to archive pushes is`);

            // ~~~ ITERATE APPS AND CLEAN OLDEST PUSHES
            let tasks = _.map(apps, (app)=>{
                return function task (callback){

                    // ~~~ FIND 0-LEVEL PUSHES
                    // lets get all 0-level Pushes for each App
                    // and remove what is too old
                    logger.debug(`[Archiver] Inspecting ${app.name}`);

                    Push.find({
                        appId: app._id,
                        parent: undefined // 0-level
                    })  .select('+appId')
                        .sort('-updatedAt')
                        .exec((err, pushes)=>{
                        if (!err){
                            //logger.debug(`[Archiver] Inspecting ${pushes.length} Pushes in App ${app.name}`);
                            if (pushes.length > config.limit.app.maxArchivedPosts){
                                let numOfPushesToCut = (pushes.length - config.limit.app.maxArchivedPosts);
                                logger.debug(`[Archiver] Going to cut the oldest ${numOfPushesToCut} Pushes in App ${app.name}`);

                                // ~~~ KEEP ONLY THE LATEST maxArchivedPosts 0-LEVEL PUSHES
                                let removeTasks = _.map(pushes.slice(0, numOfPushesToCut), (push)=> {
                                    return function removeTask(removeCallback) {
                                        push.remove((err, removed)=>{
                                            if (!err) {
                                                //logger.info(`[Archiver] Removed Push ${removed._id}`);
                                            } else {
                                                logger.error(`[Archiver] Failed to remove Push ${push._id}: parent: ${push.parent}: ${err}`);
                                            }
                                            removeCallback(err, removed);
                                        });
                                    }
                                });
                                async.series(removeTasks, function(err, results) {
                                    logger.debug(`[Archiver] removed ${results.length} Pushes in App ${app.name}`);
                                    callback(null, results.length);
                                });

                            } else {
                                callback(null, 0);
                            }

                        } else {
                            callback(err);
                        }
                    });
                };
            });
            async.series(tasks, function(err, results) {
                cb && cb();
            });
        }
    })
};