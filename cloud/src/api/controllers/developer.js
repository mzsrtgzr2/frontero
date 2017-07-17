'use strict';

const passport = require('passport');
const Developer = require('../../shared/models/developer');
const {validateDeveloperCreate} = require('./general/validators');
const {errorCodes,getExtendedError} = require('../helpers//error.codes');

module.exports.controller = (router, bfPolicies) => {
	router
		.get('/developer/:id',
            bfPolicies.team.queries, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }), // authenticate
            (req, res, next) => {
                // privacy for the authenticated developer
                if (req.params.id!=req.user._id) {
                    return next(getExtendedError(errorCodes.unauthorized));
                }

                Developer.findById(req.params.id, (err, developer) => {
                    if (err  || !developer) return next(err);
                    res.send(developer);
                });
		})
		.post('/developer',
            bfPolicies.team.creations, // bruteforce protection
            validateDeveloperCreate,
            (req, res, next) => {
                let developer = new Developer(req.body);
                developer.save((err, results) => {
                    if (err || !developer) return next(err);
                    Developer.findById(results._id, (err, developer) => {
                        if (err  || !developer) return next(err)
                        res.send(developer);
                    });
                });
		})
		.put('/developer/:id',
            bfPolicies.team.changes, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            (req, res, next) => {
                // privacy for the authenticated developer
                if (req.params.id!=req.user._id) {
                    return next(getExtendedError(errorCodes.unauthorized));
                }

                let updateData = {};

                if (req.body.username){
                    updateData.username = req.body.username;
                }

                if (req.body.email){
                    updateData.email = req.body.email;
                }


                Developer.findByIdAndUpdate(
                    req.params.id,
                    updateData,
                    {}, // options
                    (err, saved) => {
                        if (err || !saved) return next(err)
                        Developer.findById(req.params.id, (err, developer) => {
                            if (err || !developer) return next(err);
                            res.send(developer);
                        });
                    });
		    })
        .delete('/developer/:id',
            bfPolicies.team.changes, // bruteforce protection
            passport.authenticate('jwt-developers', { session: false }),
            (req, res, next) => {
                // privacy for the authenticated developer
                if (req.params.id!=req.user._id) {
                    return next(getExtendedError(errorCodes.unauthorized));
                }

                Developer.findOneAndRemove({
                    _id: req.params.id
                }, (err, removed) => {
                    if (err) return next(err);
                    if (!removed) return next('youre not allowed to see this data');
                    res.send(removed._id);
                });
            });
};