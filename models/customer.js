this.Model = function(mongoose) {

    var Schema = mongoose.Schema;
    var ObjectId = Schema.ObjectId;

    var Confirmations = new Schema( {
	timestamp: {type: String},
	token: {type: String}
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
	date_created: {type:Date,default:Date.now},
	last_modified: {type:Date}
    });

    Customer.pre('save',function(next) {
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

