'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate');
const {MongooseUpsertPlugin} = require('./plugins/mongoose.upsert.plugin.js');
const Types = mongoose.Schema.Types;


const ChannelSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    appId: {
        type: Types.ObjectId,
        ref: 'App',
        required: true
    }
}, {
    timestamps: true //This will automatically add createdAt and updatedAt fields to your schema.
});

ChannelSchema.plugin(mongoosePaginate);
ChannelSchema.plugin(MongooseUpsertPlugin);

module.exports = mongoose.model('Channel', ChannelSchema);