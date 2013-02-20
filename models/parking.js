var wembliUtils = require('wembli/utils');
var async       = require('async');
var wembliModel = require('../lib/wembli-model');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;


	var Parking = new Schema({
		customerId: {type: String, index: true},
		planId: {type:String, index:true, required:true},
		created: {type: Date,	default: Date.now	},
		updated: Date,
	},{
		autoIndex : (typeof app !== "undefined") ? app.settings.autoIndex : true,
		collection: "parking"
	});

	Parking.pre('save', function(next) {
		this.updated = new Date();
		next();
	});


	try {
		return mongoose.model('parking');
	} catch(e) {
		return mongoose.model('parking',Parking);
	}
};
