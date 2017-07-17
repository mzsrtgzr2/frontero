'use strict';

require('datejs');
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Types = mongoose.Schema.Types;

const AppSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        index: true
    },
    key: {
        type: String,
        unique: true,
        required: true,
        lowercase: true,
        index: true
    },
    secret: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    developerId: {
        type: Types.ObjectId,
        ref: 'Developer',
        required: true,
        index: true
    },
    pushesDailyLimit: {
        counter: Types.Number,
        date: Types.Date
    }
}, {
    timestamps: true //This will automatically add createdAt and updatedAt fields to your schema.
});

// checking if secret is valid
AppSchema.methods.validSecret = function(s) {
    return s == this.secret;
};

// check daily limit
AppSchema.methods.isAllowedMorePushesToday = function() {
    if (this.pushesDailyLimit==null ||
        this.pushesDailyLimit.counter==null ||
        this.pushesDailyLimit.counter>0){
        return true;
    } else {
        return false;
    }
};

AppSchema.methods.updateLimiters = function(next) {
    let today = Date.today();
    if (this.pushesDailyLimit==undefined ||
        this.pushesDailyLimit.date == undefined ||
        this.pushesDailyLimit.counter==undefined){
        
        this.pushesDailyLimit = {
            counter: mongoose.config.limit.app.maxPushesPerDay,
            date: today
        }
    }

    if (this.pushesDailyLimit.date < today) {
        this.pushesDailyLimit.counter = mongoose.config.limit.app.maxPushesPerDay - 1;
        this.pushesDailyLimit.date = today;
    } else if (this.pushesDailyLimit.counter>0){
        this.pushesDailyLimit.counter--;
    } else {
        if (process.env.NODE_ENV=='production') {
            return next(new Error('unable to update limiters'))
        }
    }

    this.save(next);
};

AppSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('App', AppSchema);