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
	guid: {type: String,unique: true},
	activity: [Activity],
	date_created: {type:Date,default:Date.now},
	last_modified: {type:Date}
    });

    Feed.statics.logActivity = function(args,callback) {
	//log an updated plan feed event
	/*
	var actor = {name:c.first_name+' '+c.last_name,
		     keyName:'organizer',
		     keyValue:'organizer'};
	var action = {name:'updatePlan'};
	var meta = {};
	var activity = {action:action,
			actor:actor,
			meta:meta};

	*/
	Feed.findOne({guid:args.guid},function(err,feed) {
	    if (err) {
		console.log(err);
	    } else {
		if (feed == null) {
		    action.name = 'initPlan';
		    var f = new Feed({guid:args.guid,activity:[activity]});
		    f.save();
		} else {
		    feed.activity.push(activity);
		    feed.markModified('activity');
		    feed.save();
		}
	    }
	});
    };


    try {
    	return mongoose.model('feed');
    } catch(e) {
    	return mongoose.model('feed',Feed);
    }
};

