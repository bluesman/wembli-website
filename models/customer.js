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
	console.log(f);
	var friends = {};
	for (friend in f) {
	    console.log(friend);
	    friends[friend.email] = friend;
	}
	console.log(friends);
	return friends;
    };

    var unMapFriends = function(f) {
	console.log('unmapping friends');
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
	friends: {type:{},get:mapFriends,set:unMapFriends},
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
	console.log('called save');
	this.last_modified = new Date();
	next();
    });

    /*
    Customer.full_name = function(){ 
	return this.first_name + ' ' + this.last_name 
    };

    Customer.findByEmail = function(email){
	return this.find({email: email});
    };


    */
    //not sure if mongoose does connection pooling - i hope so :)
    //var db = mongoose.connect(mongoose.dbSetting);
    mongoose.model('customer',Customer);
    return mongoose.model('customer');
};

