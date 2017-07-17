'use strict';

const passport = require('passport');
const User = require('../../shared/models/user');

module.exports.controller = (router, bfPolicies) => {
    router
        .get('app/:appId/user/:userId',
            bfPolicies.team.queries, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            (req, res, next) => {
                App.findOne({
                    _id: req.params.appId,
                    developerId: req.user._id
                }, (err, app) => {
                    if (err || !app) return next(err);
                    User.findOne({
                        _id: req.params.userId,
                        appId: req.params.appId
                    }, (err, u) => {
                        if (err || !u) return next(err)
                        res.send(u);
                    });
                });

        });
};