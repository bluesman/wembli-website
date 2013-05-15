var wembliUtils = require('wembli/utils');
var async = require('async');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var Activity = new Schema({
		created: {
			type: Date,
			default: Date.now
		},
		actor: {
			name: String,
			customerId: String,
		},
		action: {
			name:String
		},
		meta: {}
	});

	var Feed = new Schema({
		planGuid: {
			type: String,
			index: true,
			required: true,
			unique: true
		},
		activity: [Activity],
		created: {
			type: Date,
			default: Date.now
		},
		updated: {
			type: Date
		}
	},{
		autoIndex : (typeof app !== "undefined") ? app.settings.autoIndex : true,
		collection: "feed"
	});

	Feed.pre('save', function(next) {
		this.updated = new Date();
		next();
	});

	try {
		return mongoose.model('feed');
	} catch (e) {
		return mongoose.model('feed', Feed);
	}
};
