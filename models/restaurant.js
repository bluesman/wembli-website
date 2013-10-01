var wembliUtils = require('wembli/utils');
var async       = require('async');
var wembliModel = require('../lib/wembli-model');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;

	var Restaurant = new Schema({
		planId: {type:String, index:true, required:true},
		planGuid: {type:String,index:true,required:true},
		purchased: {type:Boolean,default:false},
		service:String,
		requestId: String,
		eventId: String,
		restaurant: {},
		payment: 	{
			organizer:{type:Boolean,default:false},
			receipt:{},
			manual:{},
			customerId:String,
			amount: Number,
			qty: Number
		},
		qty:Number,
		total:Number,
		gone: {type:Boolean,default:false},
		created: {type: Date,	default: Date.now	},
		updated: Date,
	},{
		autoIndex : (typeof app !== "undefined") ? app.settings.autoIndex : true,
		collection: "restaurant"
	});


	Restaurant.pre('save', function(next) {
		/* convert payment.amount to cents */
		/* convert total to cents */
		/* have the client do this
		if (typeof this.total !== "undefined") {

			this.total = parseFloat(this.total) * 100;
		}

		if (typeof this.payment !== "undefined") {
			this.payment.amount = parseFloat(this.payment.amount) * 100;
		}
		*/
		this.updated = new Date();
		next();
	});

	Restaurant.post('save', function(doc) {
		/* convert payment.amount to cents */
		/* convert total to cents */
		/* have the client do this
		if (typeof this.total !== "undefined") {
			this.total = parseFloat(this.total) / 100;
		}
		if (typeof this.payment !== "undefined") {
				this.payment.amount = parseFloat(this.payment.amount) / 100;
		}
		*/
	});


	try {
		return mongoose.model('restaurant');
	} catch(e) {
		return mongoose.model('restaurant',Restaurant);
	}
};
