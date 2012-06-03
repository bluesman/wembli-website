var querystring = require('querystring');
var fs = require('fs');
var mailer = require("../../lib/wembli/sendgrid");
var crypto = require('crypto');
var wembliUtils   = require('wembli/utils');
var wembliModel   = require('wembli-model');
var Customer      = wembliModel.load('customer');
var Feed          = wembliModel.load('feed');

module.exports = function(app) {

    app.all('/signup/facebook',function(req,res) {
    });

    app.get('/signup', function(req, res) {
	res.render('signup', {
	    session: req.session,
	    layoutContainer: true,
	    cssIncludes: [],
	    jsIncludes: [],
	    title: 'wembli.com - Signup now.',
	    page:'index',
	    globals:globalViewVars	    
	});
	
    });
    
    app.post(/\/signup\/?/, function(req, res){
	if (!req.param('email')) {
	    req.flash('signup-error','Please make sure all the form items are filled.');
	    return res.redirect('/signup');
	}

	//TODO: make sure passwords match
	if ( !req.param('password') || !req.param('password2') ) {
	    req.flash('signup-error','Please make sure all the form items are filled.');
	    return res.redirect('/signup');
	}		    

	if ( req.param('password') != req.param('password2') ) {
	    req.flash('signup-error','The passwords do not match.');
	    return res.redirect('/signup');
	}		    


	//fetch the customer by email 
	Customer.findOne({email:req.param('email')},function(err,c) {
	    var hash = crypto.createHash('sha512');
	    hash.update(req.param('password'));
	    var digest = hash.digest(encoding='base64');
	    digest = digest.replace(/\//g,'');	    
	    //if no c make one email param
	    if (c == null) {

		var newC = {email: req.param('email'),
			    first_name: req.param('first_name'),
			    last_name: req.param('last_name'),
			    password: digest,
			    confirmed: false
			   };
		
		//if there's ipinfo in the session grab the zip   
		if (/\d+/.test(req.session.ipinfo.zipCode)) {
		    newC.zip_code = req.session.ipinfo.zipCode;
		}
		var customer = new Customer(newC);
		console.log(customer);

		//make a confirmation token   
		hash = crypto.createHash('md5');
		var confirmationTimestamp = new Date().getTime().toString();
		hash.update(req.param('email')+confirmationTimestamp);
		var confirmationToken = hash.digest(encoding='base64');
		confirmationToken = confirmationToken.replace(/\//g,'');	    
		
		customer.confirmation.push({timestamp: confirmationTimestamp,token: confirmationToken});
		console.log('saving currentplan after signup:');
		console.log(req.session);
		if ((req.session.isOrganizer != "undefined") && (req.session.isOrganizer)) {
		    customer.eventplan.push(req.session.currentPlan);
		}
		customer.save(function(err) {
		    //console.log('customer save err: '+err);
		    
		    //log created plan activity feed
		    var actor = {name:customer.first_name+' '+customer.last_name,
				 keyName:'organizer',
				 keyValue:'organizer'};
		    var action = {name:'initPlan'};
		    var meta = {};
		    var activity = {action:action,
				    actor:actor,
				    meta:meta};
		    
		    var f = new Feed({guid:req.session.currentPlan.config.guid,activity:[activity]});
		    f.save();
		    
		    //iterate through customer.properties 
		    //for each prop: customer.prop = (c.prop ? c.prop : ((typeof result.prop != 'undefined') ? result.prop : null));  
		    req.session.loggedIn = true;
		    req.session.customer = customer;
		
		    //send a confirmation email   
		    var confirmLink = "http://"+app.settings.host+".wembli.com/confirm";
		    var emailEsc = encodeURIComponent(req.session.customer.email);
		    var tokenEsc = encodeURIComponent(req.session.customer.confirmation[0].token);
		    var confirmLinkEncoded = confirmLink + '/' + emailEsc + '/' + tokenEsc;
		    console.log(confirmLinkEncoded);
		   
		    //send the email asynchronously
		    res.render('email-templates/signup', {
			confirmLink:confirmLinkEncoded,
			layout:'email-templates/layout',
		    },function(err,htmlStr) {
			var mail = {
			    from: '"Wembli Support" <help@wembli.com>',
			    to:req.session.customer.email,
			    headers: {
				'X-SMTPAPI': {
				    category : "signup",
				}
			    },

			};
			
			mail.subject = "Welcome to Wembli.com";
			//templatize this 
			mail.text = 'Click here to confirm your email address: http://'+app.settings.host+'.wembli.com/confirm/'+encodeURIComponent(req.session.customer.email)+'/'+encodeURIComponent(confirmationToken);
			mail.html = htmlStr;
			mailer.sendMail(mail,function(error, success){
			    console.log("Message "+(success?"sent":"failed:"+error));
			});
		    
		    });

		    //if there is a redirectUrl, show a flash message indicating successful signup
		    var redirectUrl = '/dashboard';
		    if (req.param('redirectUrl')) {
			//req.flash('info','Signup was successful and your work was saved.');
			redirectUrl = req.param('redirectUrl');
		    }
		    return res.redirect( redirectUrl );		    
		});
		
	    } else {
		//they've already signed up
		req.flash('signup-error','An account with that email exists.');
		return res.redirect('/signup');
	    }

	});

    });

};