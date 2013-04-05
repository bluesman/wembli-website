var wembliUtils = require('wembli/utils');
var async       = require('async');
var wembliModel = require('../lib/wembli-model');
var Friend      = wembliModel.load('friend');
var Ticket      = wembliModel.load('ticket');
var Parking     = wembliModel.load('parking');
var Restaurant  = wembliModel.load('restaurant');
var Hotel       = wembliModel.load('hotel');
var uuid        = require('node-uuid'); //this is for making a guid
//var Feed        = wembliModel.load('feed');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var Plan = new Schema({
		guid : {type: String, index: {unique : true}, required:true },
		event : {
			eventServiceProvider : {type:String, default: 'tn' },
			eventId : String,
			eventName : String,
			eventDate : Date,
			eventVenue: String,
			eventCity: String,
			eventState: String
		},
		preferences : {
			payment: String,
			addOns: {
				parking : {type: Boolean, default:true},
				restaurants : {type: Boolean, default:false},
				hotels : {type: Boolean, default:false},
			},
			inviteOptions: {
				/* can guests invite their friends? */
				guestFriends : {type: Boolean, default:true},

				/* should we let guests know this is a 21 and over event? */
				over21 : {type: Boolean, default:false},
			},
			/* who is allowed to view the guest list */
			guestList: {type: String, default: 'rsvp'},

			/* individual plan component preferences */
			tickets : {
				priceRange: {
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:true},
					high:{type:Boolean,default:true},
				}
			},
			parking : {
				priceRange: {
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:true},
					high:{type:Boolean,default:true},
				}
			},
			hotels : {
				priceRange: {
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:true},
					high:{type:Boolean,default:true},
				}
			},
			restaurants : {
				priceRange: {
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:true},
					high:{type:Boolean,default:true},
				}
			},

		},
		rsvpDate: {type:Date, index:true},
		organizer : {type: String, index : true},
		friends: [String],
		tickets: [String],
		hotels: [String],
		parking: [String],
		restaurants: [String],
		created: {type: Date,default: Date.now},
		updated: Date,
	},{
		autoIndex : (typeof app !== "undefined") ? app.settings.autoIndex : true,
		collection: "plan"
	});

	Plan.pre('save', function(next) {
		this.updated = new Date();
		next();
	});

	Plan.pre('remove', function(next) {
		/* remove friends where planId = this.id */
		Friend.remove({planId:this.id}).exec();
		Ticket.remove({planId:this.id}).exec();
		Parking.remove({planId:this.id}).exec();
		Restaurant.remove({planId:this.id}).exec();
		Hotel.remove({planId:this.id}).exec();

	});


	/* methods */
	Plan.methods.addHotel = function(hotel,callback) {
		return this.addItem('hotels',hotel,callback);
	}

	Plan.methods.addRestaurant = function(restaurant,callback) {
		return this.addItem('restaurants',restaurant,callback);
	}

	Plan.methods.addTicket = function(ticket,callback) {
		return this.addItem('tickets',ticket,callback);
	}

	Plan.methods.addParking = function(parking,callback) {
		return this.addItem('parking',parking,callback);
	}

	Plan.methods.addFriend = function(friend,callback) {
		return this.addItem('friends',friend,callback);
	}

	Plan.methods.addItem = function(key,item,callback) {
		console.log('add '+item+ 'to plan['+key+'] '+ this.guid);
		var id = (typeof item === "string") ? item : item.id;
		if (!id) {
			return callback('no id to add to plan '+key);
		}

		var p = this;
		//check if this plan is in the list yet
		async.detect(p[key],function(el,cb) {
			 return cb((id === el));
		}, function(result) {
			if (typeof result === "undefined") {
				console.log('this id '+id+' was not already in plan.'+key+' so adding it');
				p[key].push(id);
				p.markModified(key);
				p.save(callback);
			} else {
				callback();
			}
		});
	};


	/* statics */
	Plan.statics.makeGuid = function() {
		return uuid.v1();
	};

	Plan.statics.findByGuid = function(guid, callback) {
		console.log('find by guid: '+guid);
		this.findOne({guid: guid}, callback);
	};



	try {
		return mongoose.model('plan');
	} catch(e) {
		return mongoose.model('plan',Plan);
	}
};
