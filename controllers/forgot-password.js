var querystring = require('querystring');
var fs = require('fs');
var mailer = require("../lib/wembli/sendgrid");
var crypto = require('crypto');
var wembliUtils   = require('wembli/utils');
var wembliModel   = require('../lib/wembli-model');
var Customer      = wembliModel.load('customer');

module.exports = function(app) {
    /*
      general flow:
      1. load a i forgot my password form (collect email address) - this is a modal in views/includes/modal
      2. handle post of form, collect email
      - generate forgot-password token
      - email link with token to email address
      3. display "check your email for further instructions" page
      4. handle email click
      - make sure token is not expired
      - make sure token/email address jive
      - display enter new password form
      5. handle post of new password form
      - make sure token is not expired
      - make sure token and email jive
      - update password for customer
      6. log them in
    */

    app.get(/\/reset-password\/(.*?)\/(.*)\/?/, function(req, res){    
	Customer.findOne({email:req.params[0]},function(err,c) {	
	    if (c == null) {
		console.log('no customer');
		//TODO: wonky
		return res.redirect( '/' );
	    }

	    if (typeof c.forgot_password[0] == "undefined") {
		//no crystal
		console.log('no forgot password');
		return res.redirect( '/' );
	    }

	    //check if this token is expired
	    var dbTimestamp = c.forgot_password[0].timestamp;
	    var currentTimestamp = new Date().getTime();
	    var timePassed = (currentTimestamp - dbTimestamp)/1000;                                                  
	    //has it been more than 2 days?
	    if (timePassed > 172800) {     
		console.log('token is expired');
		//token is expired - handle this better someday
		return res.redirect( '/' );
	    }
	
	    //all good - let them enter a new password
            return res.render('reset-password', {
                cssIncludes: [],
                jsIncludes: [],
		globals:globalViewVars,
                title: 'wembli.com - reset password',
		email: c.email,
		token: c.forgot_password[0].token,
		layoutContainer:true,
            });
        });
    });

    app.post('/reset-password', function(req, res) {
	//make sure pass1 and pass2 are ==
	if (req.param('password') != req.param('password2')) {
            return res.render('reset-password', {
                cssIncludes: [],
                jsIncludes: [],
                title: 'wembli.com - reset password',
		layoutContainer:true,
		email:req.param('email'),
		token: req.param('token'),
                errors:{passwordMismatch:true},
            });
	}

	//validate email and token again
	Customer.findOne({email:req.param('email')},function(err,c) {	
	    if (c == null) {
		//TODO: wonky
		return res.redirect( '/' );
	    }

	    if (typeof c.forgot_password == "undefined") {
		//no crystal
		return res.redirect( '/' );
	    }

	    //check if this token is expired
	    var dbTimestamp = c.forgot_password[0].timestamp;
	    var currentTimestamp = new Date().getTime();
	    var timePassed = (currentTimestamp - dbTimestamp)/1000;                                                  
	    //has it been more than 2 days?
	    if (timePassed > 172800) {             
		console.log('token expired');
		//token is expired - handle this better someday
		return res.redirect( '/' );
	    }

	    //make sure the passed in token matches the db token
	    if (req.param('token') != c.forgot_password[0].token) {
		console.log('db token doesnt match');
		return res.redirect( '/' );
	    }	

	    //all good, update the password in the db, log in and send to dashboard
	    var hash = crypto.createHash('sha512');
	    hash.update(req.param('password'));
	    var digest = hash.digest(encoding='base64');
	    digest = digest.replace(/\//g,'');
	    c.password = digest;
	    c.forgot_password = [];
	    c.save(function(err) {
		//log em in
		req.session.loggedIn = true;
		req.session.customer = c;
		req.session.message = {status: 'success',message: 'Successfully updated your password.'};
		res.redirect('/dashboard');
	    });
	});
    });


    app.post('/forgot-password', function(req, res){
	if (!req.param('email')) {
	    console.log('no email to reset password for!');
	    //no crystal - make this better someday
	    return res.redirect( '/' );
	}

	if ((typeof req.session.loggedIn != "undefined") && req.session.loggedIn) {
	    console.log('customer is logged in!');
	    //retard is already logged in
	    return res.redirect('/dashboard');
	}

	Customer.findOne({email:req.param('email')},function(err,c) {	
	    if (c == null) {
		//clear out any existing customer (logout doesn't do this by design
		delete req.session.customer;
		console.log('no customer for this email to reset password for!');
		//TODO: fix this - they tried to give us an email for an account that doesn't exist
		return res.redirect( '/' );
	    }

	    var noToken = true;
	    var tokenHash = '';
	    var tokenTimestamp = '';

	    //have a c, make a forgot password token (or if there is already one in the db that is not expired, use it
	    if (typeof c.forgot_password[0] != "undefined") {
		//check if this token is expired
		var dbTimestamp = c.forgot_password[0].timestamp;
		var currentTimestamp = new Date().getTime();
		var timePassed = (currentTimestamp - dbTimestamp)/1000;                                                  
		//has it been more than 2 days?
		if (timePassed < 172800) {             
		    noToken = false; //they have a valid token
		}
	    }

	    if(noToken) {
		//make a new token
		var hash = crypto.createHash('md5');
		tokenTimestamp = new Date().getTime().toString();
		hash.update(req.param('email')+tokenTimestamp);
		tokenHash = hash.digest(encoding='base64');
		tokenHash = tokenHash.replace(/\//g,'');	    
	    } else {
		//use the existing token
		tokenHash = c.forgot_password[0].token;
		tokenTimestamp = c.forgot_password[0].timestamp;
	    }

	    //send an email with the link
	    var resetLink = "http://"+app.settings.host+".wembli.com/reset-password";
	    var emailEsc = encodeURIComponent(c.email);
	    var tokenEsc = encodeURIComponent(tokenHash);
	    var resetLinkEncoded = resetLink + '/' + emailEsc + '/' + tokenEsc;
	    c.forgot_password = {timestamp: tokenTimestamp,token: tokenHash};
	    c.save(function(err) {
		if (!err) {
		    res.render('email-templates/forgot-password', {
			resetLink:resetLinkEncoded,
			layout:'email-templates/layout',
			token:tokenHash,
			c: c
		    },function(err,htmlStr) {
			var mail = {
			    from: '"Wembli Support" <help@wembli.com>',
			    to:c.email,
			    headers: {
				'X-SMTPAPI': {
				    category : "forgotPassword",
				}
			    },
			    
			};
						
			mail.subject = "Reset Your Password";
			mail.text = 'Click here to reset your password: '+resetLinkEncoded;
			mail.html = htmlStr;
			mailer.sendMail(mail,function(error, success){
			    console.log("Message "+(success?"sent":"failed:"+error));
			});


			//load check your email page
			return res.render('reset-password-sent', {
			    cssIncludes: [],
			    jsIncludes: [],
			    globals:globalViewVars,
			    title: 'wembli.com - reset password email sent',
			    email:req.param('email'),
			    layoutContainer: true,
			    page:'index',
			});
		    });
		} else {
		    res.redirect('/');
		}
	    });
	});
    });
};
