this.Model = function(mongoose) {
    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var Confirmations = new Schema( {
	timestamp: {type: String},
	token: {type: String}
    });

    var ForgotPassword = new Schema( {
	timestamp: {type: String},
	token: {type: String}
    });

    var mapFriends = function(f) {
	var friends = {};
	for (idx in f) {
	    friends[f[idx].email] = f[idx];
	}
	return friends;
    };

    var unMapFriends = function(f) {
	var friends = [];
	for (email in f) {
	    friends.push(f[email]);
	}
	return friends;
    };

    var EventPlan = new Schema( {
	date_created: {type:Date,default:Date.now},
	tickets: {type:{}},
	event: {type:{}},
	//friends: {type:{},get:mapFriends,set:unMapFriends},
	friends: {type:{}},
	completed: {type:{}},
	config: {type:{}}
    });

    var Customer = new Schema( {
	first_name: {type: String},
	last_name: {type: String},
	birthday: {type: String},
	zip_code: {type: Number},
	gender: {type: String},
	email: {type: String, unique: true},
	password: {type: String},
	confirmed: {type: Boolean,default:false},
	confirmation: [Confirmations],
	forgot_password: [ForgotPassword],
	eventplan: [EventPlan],
	date_created: {type:Date,default:Date.now},
	last_modified: {type:Date}
    });

    Customer.pre('save',function(next) {
	this.last_modified = new Date();
	next();
    });

    Customer.methods.test = function() {
	console.log('test');
    };

    Customer.methods.saveCurrentPlan = function(plan,callback) {
	var plans = [];
	var saved = false;
	for (var idx in this.eventplan) {
	    //housekeeping
	    if ((typeof this.eventplan[idx].config == "undefined") || (typeof this.eventplan[idx].config.guid == "undefined")) {
		continue;
	    }

	    //add this plan if its one of the plans
	    if (this.eventplan[idx].config.guid == plan.config.guid) {
		plans.push(plan);
		saved = true;
	    } else {
		plans.push(this.eventplan[idx]);
	    }
	}

	//no plans, put this one in
	if (!saved) {
	    plans.push(plan);
	}

	this.eventplan = plans;
	this.markModified('eventplan');
	this.save(function(err) {
	    if (err) {
		console.log('error saving customer: '+err);
	    }

	    if (typeof callback != "undefined") {
		callback(err);
	    }
	});
    };

    Customer.statics.findPlanByGuid = function(guid,callback) {
	//get plan by guid and set it in the session
	var query = this.findOne({});
	query.where('eventplan').elemMatch(function (elem) {
	    elem.where('config.guid', guid)
	});
	query.exec(callback);
    };


    Customer.methods.full_name = function(){ 
	return this.first_name + ' ' + this.last_name 
    };

    Customer.statics.findByEmail = function(email,callback){
	return this.find({email: email},callback);
    };


    //not sure if mongoose does connection pooling - i hope so :)
    //var db = mongoose.connect(mongoose.dbSetting);
    mongoose.model('customer',Customer);
    return mongoose.model('customer');
};

