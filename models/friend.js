var wembliUtils = require('wembli/utils');
var async       = require('async');
var wembliModel = require('../lib/wembli-model');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	/*
	 * possible payment types: request|outside|response
	 * possible payment status: queued|delivered|opened|responded|completed|canceled
	 * possible payment methods: check|cash|creditcard|paypal|other
	 * payment.open means the transaction has not been completed.
	 *  for a type: request, it means there is no response yet or the request is not canceled
	 *  for a type: response, it means the response has not cleared yet
	 * payment.amount is the amount the organizer is requesting
	 * payment.transactionFee is the fee wembli charges to collect a pony up from a friend
	 * payment.total is the fee + amount (i.e. total that the friend gets charged)
	 */
	var Payment = new Schema({
		amount:Number,
		total:Number,
		transactionFee:Number,
		date:{type:Date,default:Date.now()},
		method:String,
		type:String,
		status:String,
		open: {type: Boolean, default: true},
		requestId: String,
		transaction:{},
		email:{}
	});

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
		/* this should move under rsvp and payment */
		email: {
			'rsvp': {},
			'pony-up-request': {}
		},
		rsvp:{
			token:String,
			tokenTimestamp:String,
			/* message to send when sending the rsvp */
			message:String,
			/* rsvp.status can be:
					pending: the rsvp has not be sent to the friend yet
					queued: the rsvp will be sent once the organizer account is confirmed
					requested: the organizer has sent the rsvp request to the friend
					responded: the friend has provided a response (which is found in rsvp.decision)
			*/
			status:{type:String, default:'pending'},
			/* the last time the organizer requested the rsvp */
			requestedLastDate:{type:Date, default: null},
			/* has the friend viewed the rsvp? */
			viewed:{type:Number,default:0},
			/* date the friend last viewed the rsvp */
			viewedLastDate:{type:Date, default: null},
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
			tickets: {
				/* number of tickets including self */
				number:Number,
				decision:Boolean,
				decidedLastDate:Date,
				price:{type:Number,default:50},
				priceGroup:{
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:false},
					high:{type:Boolean,default:false},
				},
				preference: [],
			},
			restaurant: {
				number:Number,
				decision:Boolean,
				decidedLastDate:Date,
				price:{type:Number,default:20},
				priceGroup:{
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:false},
					high:{type:Boolean,default:false},
				},
				preference: [],
			},
			hotel: {
				number:Number,
				decision:Boolean,
				decidedLastDate:Date,
				price:{type:Number,default:150},
				priceGroup:{
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:true},
					high:{type:Boolean,default:false},
				},
				preference: [],
			},
			parking: {
				number:Number,
				decision:Boolean,
				decidedLastDate:Date,
				price:{type:Number,default:10},
				priceGroup:{
					low:{type:Boolean,default:true},
					med:{type:Boolean,default:false},
					high:{type:Boolean,default:false},
				},
				preference: [],
			},
		},
		payment: [Payment],
		created: {type: Date,	default: Date.now()	},
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
