var querystring = require('querystring');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');

/* 
make sure the session variable reflects the login state
we can log in through the standard login form or through facebook.
If the user logs in through facebook we need to know if they are logged in
so when they first load a page they are remembered and not asked to log in.
this function sets up the phatseat session if they are logged into facebook
*/
module.exports = function(req,res,next) {
    /*
    console.log(req.session.cookie.expires);
    console.log(req.session.cookie.maxAge);
    */

    //new eventplan if there isn't one already
    if (typeof req.session.currentPlan == "undefined") {
	req.session.currentPlan = {};
    }

    //default to them not being an organizer
    if (typeof req.session.isOrganizer == "undefined") {
	req.session.isOrganizer = false;
    }

    //first check the session
    //console.log('loggedIn: '+req.session.loggedIn);
    if (req.session.loggedIn) {
	//console.log(req.session.customer);
	if (typeof req.session.customer == 'string') {
	    console.log('parsing customer session');
	    req.session.customer = JSON.parse(req.session.customer);
	}
	    
	//refresh customer from the db
	Customer.findOne({email:req.session.customer.email},function(err,customer) {
	    if (err != null || customer == null) {
		//console.log('error finding customer for session!: '+err);
		delete req.session.customer;
		req.session.loggedIn = false;
		req.flash('error','An Error ocurred, Please try again or contact help@wembli.com.');
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
}


