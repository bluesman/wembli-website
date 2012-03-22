var querystring = require('querystring');
var async       = require('async');
var crypto      = require('crypto');
var wembliUtils   = require('wembli/utils');
var wembliModel   = require('wembli-model');
var Customer      = wembliModel.load('customer');

module.exports = function(app) {
    console.log('login loaded...');
    app.get('/login/?', function(req,res,next) {
	//if they try to load the login page while alredy logged in
	if (req.session.loggedIn) {
	    console.log(req.session.customer);
	    //redirect to the dashboard
	    return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard') );	
	}
	console.log('login');
	var errors = {};
	if (req.param('errors') == '200') {
	    errors.facebook = true;
	}
	
	res.render('login', {
	    session: req.session,
	    layoutContainer: true,
	    cssIncludes: [],
	    jsIncludes: [],
	    title: 'wembli.com - login to get the best seats.',
	    params: {remember:req.session.remember,email:((req.session.remember && (typeof req.session.customer != "undefined")) ? req.session.customer.email : null)},
	    errors: errors,
	    page:'index',
	    globals:globalViewVars	    
	});
    });

    app.post('/login/?', function(req, res) {
	req.session.remember = req.param('remember');
	console.log(req.param('fbLoginHidden'));
	//if there is no email address, try fb login
	if (req.param('fbLoginHidden') == 1) {
	    console.log('fb login');
	    fbLogin(req, res);
	} else {
	    console.log('standard login');
	    standardLogin(req, res);
	}
    });
};
/*
var fbLogin = function(req,res) {
    //check for the fb cookie
    var fbCookie = 'fbs_'+fbAppId;
    var args = phatseatUtils.parseFacebookCookie(req.cookies[fbCookie]);
    console.log(args);
    
    if (args && args.access_token) {
	console.log('got a facebook cookie');
	
	req.session.fbCookie = args;
	//try and fetch their email to make sure they haven't logged out of fb
	
	var stream = fbClient.apiCall('GET', '/me',
				      {access_token: args.access_token},
				      function(error,response,result) {
					  req.session.facebookMe = result;

					  if (error) {
					      console.log(error);
					      
					      res.render('login', {
						  session: req.session,
						  cssIncludes: [],
						  jsIncludes: [],
						  title: 'phatseat.com - login to get the best seats.',
						  params: {remember:req.session.remember,email:( req.param('email') ? req.param('email') : req.session.customer.email) },
						  errors: {facebook:true}
					      });
					      return;
					  } else {
					      console.log('found fb cookie - logging in');
					      req.session.loggedIn = true;
					      req.session.fbAuth   = true;
					      console.log(result);
					      //fetch the customer by email
					      Customer.findOne({email:result.email},function(err,c) { 
						  
						  //if no c make one from fb cookie
						  if (c == null) {
						      var newC = {first_name: result.first_name,
								  last_name: result.last_name,
								  birthday: result.birthday,
								  gender: result.gender,
								  email: result.email,
								  confirmed: true
								  };

						      //if there's ipinfo in the session grab the zip
						      if (/\d+/.test(req.session.ipinfo.zipCode)) {
							  newC.zip_code = req.session.ipinfo.zipCode;
						      }

						      var customer = new Customer(newC);
						      customer.save();
						      //iterate through customer.properties
						      //for each prop: customer.prop = (c.prop ? c.prop : ((typeof result.prop != 'undefined') ? result.prop : null));
						      //now customer.save();
						      //req.session.customer = customer;
						      req.session.customer = customer;
						  } else {
						      req.session.customer = c;						      
						  }
						  return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard') );
					      });
					  }
				      });
    } else {
	console.log('no fb cookie set');

	res.render('login', {
	    session: req.session,
	    cssIncludes: [],
	    jsIncludes: [],
	    title: 'phatseat.com - login to get the best seats.',
	    params: {remember:req.session.remember},
	    errors: {facebook:true}
	});

    }
    
    };
*/

var standardLogin = function(req,res) {
    //refactor this because now password-confirm in dashboard uses the same code
    var hash = crypto.createHash('sha512');
    hash.update(req.param('password'));
    var digest = hash.digest(encoding='base64');
    console.log('logging in: '+req.param('email'));
    //validate email/password against the db
    Customer.findOne({email:req.param('email')},function(err,c) { 
	if ((err == null) && (c != null)) {
	    console.log('dbpass: '+c.password);
	    console.log('postpass: '+digest);
	    //set up the session and head to the redirect url
	    if (typeof c.password != "undefined" && c.password == digest) {
		console.log('valid credentials..logging in');
		req.session.loggedIn = true;
		//req.session.customer = {email: c.email};
		req.session.customer = c;
		return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard') );
	    }
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
};


