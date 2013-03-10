var wembliUtils = require('wembli/utils');
var async       = require('async');
var wembliModel = require('../lib/wembli-model');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;


	var Friend = new Schema({
		customerId: {type: String, index: true},
		planId: {type:String, index:true, required:true},
		planGuid: {type:String,index:true,required:true},
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
		/* inviteStatus is true if a message has actually been sent to the friend
			and signifies that this friend is actually invited.  if inviteStatus is false
			it means the organizer uninvited the friend or the friend never got an invitation
			friends that have been uninvited will have inviteStatus of false and rsvp.initiated == true
		 */
		inviteStatus:{type:Boolean,default:true},

		/* inviteStatusConfirmation is a token used by the social callbacks..
			facebook or twitter will hit a wembli callback url and pass in the token
			this confirms that that message was successfully posted or tweeted
		*/
		inviteStatusConfirmation:{
			timestamp:Date,
			token:String
		},
		rsvp:{
			initiated:{type:Boolean, default:false},
			initiatedLastDate:{type:Date, default: null},
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
