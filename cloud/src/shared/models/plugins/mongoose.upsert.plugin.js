const mongoose = require('mongoose');

export function MongooseUpsertPlugin(schema) {
    schema.statics.upsert = function upsert(query, data, isAllowedToInsert , cb=null) {
        let self = this;

        self.findOne(query, function (err, doc) {
                if (err || !doc ){
                    // we couldn't find that document
                    // so it doesn't exist... can we insert?
                    if (isAllowedToInsert){
                        let ndoc = new self(data);
                        ndoc.save((err, doc)=>{
                            if (err || !doc ){
                                // can't insert
                                cb && cb(new Error('cant create resource'));
                            } else {
                                // all good, we created new doc
                                cb && cb(null,
                                        true, //new doc created*
                                        doc);
                            }
                        });
                    } else {
                        // nothing more for us to do
                        // return reject
                        cb && cb(new Error('cant find resource'));
                    }
                } else if (doc){
                    // lets update
                    self.findOneAndUpdate(query, data, {
                            new: true // return the updated doc, not the old one..
                        }, function (err, doc) {
                            cb && cb(null,
                                false, // doc was updated
                                doc);
                        });
                } else {
                    // this REALLY shouldn't have happen...
                    // no wat err==null and doc==null
                    cb && cb(new Error('terrible error happened'));
                }
            });
    };
}