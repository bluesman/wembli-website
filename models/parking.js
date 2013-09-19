var wembliUtils = require('wembli/utils');
var async       = require('async');
var wembliModel = require('../lib/wembli-model');

this.Model = function(mongoose) {
	var Schema = mongoose.Schema;
	var ObjectId = Schema.ObjectId;


	var Parking = new Schema({
		planId: {type:String, index:true, required:true},
		planGuid: {type:String,index:true,required:true},
		purchased: {type:Boolean,default:false},
		service:String,
		requestId: String,
		eventId: String,
		parking: {},
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
		collection: "parking"
	});

	Parking.pre('save', function(next) {
		/* convert payment.amount to cents */
		/* convert total to cents */
		if (typeof this.total !== "undefined") {
			console.log('convert total to cents:'+this.total);
			this.total = parseFloat(this.total) * 100;
		}

		if (typeof this.payment !== "undefined") {
			this.payment.amount = parseFloat(this.payment.amount) * 100;
		}

		this.updated = new Date();
		next();
	});

	Parking.post('save', function(doc) {
		/* convert payment.amount to cents */
		/* convert total to cents */
		if (typeof this.total !== "undefined") {
			console.log('convert total to $:'+this.total);
			this.total = parseFloat(this.total) / 100;
			console.log('total:'+this.total);
		}
		if (typeof this.payment !== "undefined") {
				this.payment.amount = parseFloat(this.payment.amount) / 100;
		}
	});

	try {
		return mongoose.model('parking');
	} catch(e) {
		return mongoose.model('parking',Parking);
	}
};
