var wembliUtils = require('wembli/utils');
var async       = require('async');
var wembliModel = require('../lib/wembli-model');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;


	var Friend = new Schema({
		customerId: {type: String, index: true},
		planId: {type:String, index:true, required:true},
		contactInfo:{
			service:String,
			serviceId:{type: String, index:true, required:true},
			name:String,
			imageUrl:String
		},
		preferences:{
			price:Number,
			tickets:{},
			parking:{},
			restaurants:{},
			hotels:{}
		},
		inviteStatus:{type:Boolean,default:true},
		rsvp:{
			initiated:{type:Boolean, default:false},
			initiatedLastdate:{type:Date, default: null},
			viewed:{type:Number,default:0},
			decision:{type:Boolean, default:null},
			date:{type:Date,default:Date.now}
		},
		token: {timestamp:String,token:String},
		payment: {type:{}},
		created: {type: Date,	default: Date.now	},
		updated: Date,
	},{
		autoIndex : (typeof app !== "undefined") ? app.settings.autoIndex : true,
		collection: "friend"
	});

	Friend.pre('save', function(next) {
		this.updated = new Date();
		next();
	});


	try {
		return mongoose.model('friend');
	} catch(e) {
		return mongoose.model('friend',Friend);
	}
};
