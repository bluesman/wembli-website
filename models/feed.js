var wembliUtils   = require('wembli/utils');
var async         = require('async');

this.Model = function(mongoose) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var Activity = new Schema( {
	date_created: {type:Date,default:Date.now},
	actor:{},
	action:{},
	meta:{}
    });

    var Feed = new Schema( {
	guid: {type: String,unique true},
	activity: [Activity],
	date_created: {type:Date,default:Date.now},
	last_modified: {type:Date}
    });

    Customer.pre('save',function(next) {
	this.last_modified = new Date();
	console.log('pre save');
	next();
    });

    Customer.methods.test = function() {
	console.log('test');
    };

    //not sure if mongoose does connection pooling - i hope so :)
    //var db = mongoose.connect(mongoose.dbSetting);
    mongoose.model('feed',Feed);
    return mongoose.model('feed');
};

