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
		venue : {
			venueId: String,
			data:{}
		},
		event : {
			eventServiceProvider : {type:String, default: 'tn' },
			eventId : String,
			eventName : String,
			eventDate : Date,
			eventVenue: String,
			eventCity: String,
			eventState: String,
			eventLat: Number,
			eventLng: Number,
			data:{},
		},
		active : {type:Boolean,default:true},
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
				payment: {type:String,default:'split-first'},
				priceRange: {
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:true},
					high:{type:Boolean,default:true},
				}
			},
			parking : {
				payment: {type:String,default:'split-first'},
				priceRange: {
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:true},
					high:{type:Boolean,default:true},
				}
			},
			hotels : {
				payment: {type:String,default:'split-first'},
				priceRange: {
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:true},
					high:{type:Boolean,default:true},
				}
			},
			restaurants : {
				payment: {type:String,default:'split-first'},
				priceRange: {
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:true},
					high:{type:Boolean,default:true},
				}
			},
		},
		rsvpDate: {type:Date, index:true},
		rsvpComplete: {type: Boolean, default:false},
		rsvpCompleteDate: {type:Date, index:true},
		ponyUpDate: {type:Date, index:true},
		ponyUpSent: {type:Boolean, default:false},
		ponyUpSentDate: {type:Date, index:true},
		/* organizer is a customer id */
		organizer : {
			customerId: {type: String, index : true},
			rsvp: {
				/* decision can be one of the following:
					null: no decision made
					false: not going
					true: going
				*/
				decision:{type:Boolean, default:null},
				/* how many people will this friend bring (including self) */
				guestCount:{type:Number, default:1},
				/* the most recent time they made a decision */
				decidedLastDate:{type:Date,default:Date.now()},
				/* rsvp specifically for tickets */
			}
		},
		friends: [String],
		tickets: [String],
		hotels: [String],
		parking: [String],
		restaurants: [String],
		notes: String,
		notifications:[{
			key: String,
			acknowledged:{type:Date,default:null}
		}],
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
		this.preferences.addOns.hotels = true;
		return this.addItem('hotels',hotel,callback);
	}

	Plan.methods.addRestaurant = function(restaurant,callback) {
		this.preferences.addOns.restaurants = true;
		return this.addItem('restaurants',restaurant,callback);
	}

	Plan.methods.addTicket = function(ticket,callback) {
		return this.addItem('tickets',ticket,callback);
	}

	Plan.methods.addParking = function(parking,callback) {
		this.preferences.addOns.parking = true;
		return this.addItem('parking',parking,callback);
	}

	Plan.methods.addFriend = function(friend,callback) {
		return this.addItem('friends',friend,callback);
	}

	Plan.methods.addItem = function(key,item,callback) {
		var id = (typeof item === "string") ? item : item.id;
		if (!id) {
			return callback('no id to add to plan '+key);
		}

		var p = this;
		//check if this plan is in the list yet
		async.detect(p[key],function(el,cb) {
			 return cb((id === el));
		}, function(result) {
			console.log('addItem:');
			console.log(result);
			if (typeof result === "undefined") {
				p[key].push(id);
				p.markModified(key);
				p.save(callback);
			} else {
				callback();
			}
		});
	};

	Plan.methods.removeHotel = function(hotel,callback) {
		return this.removeItem('hotels',hotel,callback);
	}

	Plan.methods.removeRestaurant = function(restaurant,callback) {
		return this.removeItem('restaurants',restaurant,callback);
	}

	Plan.methods.removeTicket = function(ticket,callback) {
		return this.removeItem('tickets',ticket,callback);
	}

	Plan.methods.removeParking = function(parking,callback) {
		return this.removeItem('parking',parking,callback);
	}

	Plan.methods.removeFriend = function(friend,callback) {
		return this.removeItem('friends',friend,callback);
	}

	Plan.methods.removeItem = function(key,item,callback) {
		var id = (typeof item === "string") ? item : item.id;
		if (!id) {
			return callback('no id to remove from plan '+key);
		}

		var p = this;
		var newItems = [];
		//check if this plan is in the list yet
		async.forEach(p[key],function(el,cb) {
			if (id !== el) {
			 	newItems.push(el);
			}
			cb();
		}, function() {
			/* save the new items */
			p[key] = newItems;
			p.markModified(key);
			p.save(callback);
		});
	};


	/* statics */
	Plan.statics.makeGuid = function() {
		return uuid.v1();
	};

	Plan.statics.findByGuid = function(guid, callback) {
		this.findOne({guid: guid}, callback);
	};

	try {
		return mongoose.model('plan');
	} catch(e) {
		return mongoose.model('plan',Plan);
	}
};
