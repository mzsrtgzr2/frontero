'use strict';

const _ = require('underscore');
const validate = require('validate.js');
const {ChannelCommands} = require('./channel.commands.js');

function _doPushAddSugar (data){
    if (validate.isString(data)) {
        data = {
            payload: {
                data: {
                    sys: {
                        type: 'text',
                        value: data
                    }
                }
            }
        };
    }  else if (data &&
        data.payload &&
        data.parentId &&
        validate.isString(data.payload)) {
        data = {
            parentId: data.parentId,
            payload: {
                data: {
                    sys: {
                        type: 'text',
                        value: data.payload
                    }
                }
            }
        };
    }

    return data;
}

module.exports.pushAddSugar = function (socketWrapper, args, next) {
        args[1] = _doPushAddSugar(args[1]);
        next();
};


module.exports.bulkSugar = function (socketWrapper, args, next) {
    let commands = args[1];

    if (validate.isArray(commands)){
        // sugar every command data
        _.each(commands, (command)=>{
            switch(command.type){
                case ChannelCommands.pushAddCommand:
                    command.data = _doPushAddSugar(command.data);
                    break;
                default:
                    break;
            }
        });
        next();
    } else {
        next();
    }

};
