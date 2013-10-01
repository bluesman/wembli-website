var querystring = require('querystring');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');

/*
make sure the session variable reflects the login state
we can log in through the standard login form or through facebook.
If the user logs in through facebook we need to know if they are logged in
so when they first load a page they are remembered and not asked to log in.
this function sets up the phatseat session if they are logged into facebook

DOCUMENTATION FOR HOW SESSION IS ORGANIZED: this should go in unfuddled

every controller will have a req.session
if you are logged in you will have:

req.session.loggedIn == true
req.session.remember == (true|false)
req.session.customer == wembli's customer data (not a customer model!!)

*/
module.exports = function(req,res,next) {
    /*
    */

    //first check the session
    /*
    if (req.session.loggedIn) {
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
		console.log('redir to login');
		return res.redirect( '/login' );
	    }
	    //console.log('found a customer for: '+customer.email);
	    console.log('caling next');
	    req.session.customer = customer;
	    next();
	});

    } else {
	//check if there's a req.user
	console.log(req.user);
	if ((typeof req.user != "undefined") && (typeof req.user.facebook.email != "undefined")) {
	    if (req.url == '/signup/facebook') {
		console.log('auth skipping to signup facebook');
		return next();
	    }

	    //they have logged in via fb but their session doesn't indicate it is so
	    Customer.findOne({email:req.user.facebook.email},function(err,c) {
		if ((err == null) && (c != null)) {
		    console.log('valid fb credentials for '+req.user.facebook.email+'..logging in');
		    req.session.loggedIn = true;
		    //req.session.customer = {email: c.email};
		    req.session.customer = c;
		    if (req.param('redirectUrl')) {
			req.flash('info','Login was successful and your work was saved.');
		    }
		    console.log('redirecting to dashboard or '+req.param('redirectUrl'));
		    return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard') );
		}

		if ((err == null) && (c == null)) {
		    //logged in via fb but there is no customer yet - redirect to signup
		    console.log('no customer for email: '+req.user.facebook.email);
		    console.log('redirecting to signupfacebook');
		    return res.redirect('/signup/facebook');
		}

		console.log('error: '+err);
		//still here? then we failed
		res.render('login', {
		    session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - login to get the best seats.',
		    params: {remember:req.session.remember,email:req.param('email') },
		    errors: {general:true},
		    globals:globalViewVars,
		    layoutContainer:true,
		});
	    },false);
	}

	//console.log('not logged in');
	//not logged in...
	next();
	}

	*/
    next();
}


