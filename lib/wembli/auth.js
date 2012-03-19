var querystring = require('querystring');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var uuid = require('node-uuid');
var redis = require("redis"),
    redisClient = redis.createClient();

/* 
make sure the session variable reflects the login state
we can log in through the standard login form or through facebook.
If the user logs in through facebook we need to know if they are logged in
so when they first load a page they are remembered and not asked to log in.
this function sets up the phatseat session if they are logged into facebook
*/
module.exports = function(req,res,next) {
    //generate a guid for the eventplan - if there isn't one already
    if (typeof req.session.eventplanGuid == "undefined") {
	req.session.eventplanGuid = uuid.v1();
    }

    //see if there's any data from the jsonrpc to sync up with
    req.session.eventplan = {};
    redisClient.hgetall('eventplan:'+req.session.eventplanGuid,function(err,obj) {
	//loop through and deserialize all the eventplan key values
	for (key in obj) {
	    //put them in the session
	    req.session.eventplan[key] = JSON.parse(obj[key]);
	}

	//first check the session
	//console.log('loggedIn: '+req.session.loggedIn);
	if (req.session.loggedIn) {
	    //console.log(req.session.customer);
	    //for some reason redis turns this into a string..sometimes..can't figure it out
	    if (typeof req.session.customer == 'string') {
		//console.log('parsing customer session');
		req.session.customer = JSON.parse(req.session.customer);
	    }
	    
	    Customer.findOne({email:req.session.customer.email},function(err,customer) {
		if (err != null || customer == null) {
		    //console.log('error finding customer for session!: '+err);
		    delete req.session.customer;
		    req.session.loggedIn = false;
		    return res.redirect( '/login' );
		}
		//console.log('found a customer for: '+customer.email);
		req.session.customer = customer;
		next();
	    });
	    
	} else {
	    //console.log('not logged in');
	    //not logged in...
	    next();
	}
    });
}


