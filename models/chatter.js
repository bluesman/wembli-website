var wembliUtils = require('wembli/utils');
var async = require('async');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var upVote = new Schema({
		actor: {
			name: String,
			imageUrl: String,
			customerId: String,
		},
		created: {
			type: Date,
			default: Date.now
		},
	});

	var Comment = new Schema({
		actor: {
			name: String,
			imageUrl: String,
			customerId: String,
		},
		upVotes: [upVote],
		body: String,
		created: {
			type: Date,
			default: Date.now
		},
	});

	var Chatter = new Schema({
		planGuid: {
			type: String,
			index: true,
			required: true,
		},
		planId: {type:String, index:true, required:true},
		actor: {
			name: String,
			imageUrl: String,
			customerId: String,
		},
		upVotes: [upVote],
		body: String,
		comments: [Comment],
		created: {
			type: Date,
			default: Date.now
		},
		updated: {
			type: Date
		}
	},{
		autoIndex : (typeof app !== "undefined") ? app.settings.autoIndex : true,
		collection: "chatter"
	});

	Chatter.pre('save', function(next) {
		this.updated = new Date();
		next();
	});

	try {
		return mongoose.model('chatter');
	} catch (e) {
		return mongoose.model('chatter', Chatter);
	}
};
