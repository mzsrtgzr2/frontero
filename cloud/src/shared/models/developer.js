'use strict';
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const mongoosePaginate = require('mongoose-paginate');
const Types = mongoose.Schema.Types;

const DeveloperSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true,
        select: false
    }
}, {
    timestamps: true //This will automatically add createdAt and updatedAt fields to your schema.
});

// methods ======================
// generating a hash
DeveloperSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
DeveloperSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

DeveloperSchema.pre('save', function(next) {
    this.password = this.generateHash(this.password);

    next();
});

DeveloperSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Developer', DeveloperSchema);