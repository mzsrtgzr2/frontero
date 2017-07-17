'use strict';
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Types = mongoose.Schema.Types;
const {MongooseUpsertPlugin} = require('./plugins/mongoose.upsert.plugin.js');

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: false,
        required: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: false,
        required: false
    },
    pic: {
        type: String
    },
    appId: {
        type: Types.ObjectId,
        ref: 'App',
        required: true
    },
    extra: {}
}, {
    timestamps: true //This will automatically add createdAt and updatedAt fields to your schema.
});

UserSchema.plugin(mongoosePaginate);
UserSchema.plugin(MongooseUpsertPlugin);

module.exports = mongoose.model('User', UserSchema);