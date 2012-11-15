var querystring = require('querystring');
var fs = require('fs');
var mailer = require("../lib/wembli/sendgrid");
var wembliUtils = require('wembli/utils');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Feed = wembliModel.load('feed');

module.exports = function(app) {

	/*
		1. submit signup form sends email to customer
		2. they click a link in the email to confirm: GET /confirm/email/token
			- if not logged in, prompt them for their password before continuing
			- if the token is expired, send them to the confirm page with a token expired error to resend confirmation
			- if not expired, set confirmed in the db and send them along to the dashboard

	*/


	app.get(/\/confirm\/(.*?)\/(.*)\/?/, function(req, res) {
		delete req.session.confirmEmailSent;

		//validate the token
		//a) must not be expired (1 week)
		//b) must be a token that belong to this customer
		//if they're not logged in, make them provide a password before confirming
		if (!req.session.loggedIn) {
			//render password page
			return res.render('confirm-need-password', {
				email: req.params[0],
				token: req.params[1],
				title: 'wembli.com - supply your password!.'
			});
		}

		var expired = true;
		var dbTimestamp = req.session.customer.confirmation[0].timestamp;
		var currentTimestamp = new Date().getTime();
		var timePassed = (currentTimestamp - dbTimestamp) / 1000;

		//has it been more than 1 week?
		if (timePassed < 604800) {
			expired = false;
		}
		if (expired) {
			req.session.confirmEmailSent = {};
			req.session.confirmEmailSent.expiredToken = true;
			return res.render('confirm-email-sent', {
				title: 'wembli.com - check your email!.'
			});
		}

		//not expired woot!
		var dbToken = req.session.customer.confirmation[0].token;
		if (dbToken == req.params[1]) {
			//set customer to confirmed so they can access the dashboard
			req.session.customer.confirmed = true;
			req.session.customer.save(function(err) {
				return res.redirect('/dashboard');
			});
		} else {
			//some sort of hackery is going down - gtfo
			req.session.confirmEmailSent = {};
			req.session.confirmEmailSent.expiredToken = true;
			return res.render('confirm-email-sent', {
				title: 'wembli.com - check your email!.'
			});

		}

	});


	//might be able to post straight to the login/index.js submit rather than use this - it supports using a redirect url on success
	app.post(/\/confirm?/, function(req, res) {
		//set the input params into a session form variable
		//validate password and log them in then redirect to GET confirm
		var digest = wembliUtils.digest(req.param('password'));

		//validate email/password against the db
		Customer.findOne({
			email: req.param('email')
		}, function(err, c) {
			if ((err == null) && (c != null)) {
				//set up the session and head to the redirect url
				if (typeof c.password != "undefined" && c.password == digest) {
					req.session.loggedIn = true;
					req.session.customer = c;
					return res.redirect('/confirm/' + encodeURIComponent(req.param('email')) + '/' + encodeURIComponent(req.param('token')));
				} else {
					//password is wrong - try again
					//count how many consecutive bad password attempts and lock them out after 3
					//count in the db rather than the session
					//render password page
					return res.render('dashboard/confirm-need-password', {
						errors: {
							general: true
						},
						email: req.param('email'),
						token: req.param('token'),
						title: 'wembli.com - supply your password!.'
					});


				}
			} else {
				//no customer for that email?? wtf goto logout
				return res.redirect('/logout');
			}

		});
	});


	app.get(/\/confirm\/resend-email\/?/, function(req, res) {
		delete req.session.confirmEmailSent;

		if (req.session.customer.confirmed) {
			//already confirmed? then send to dashboard
			return res.redirect((req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard'));
		}

		//TODO: make sure they are logged in!
		//get the customer
		//determine if the existing confirmation token should be used or overwritten
		var expired = true;
		if (typeof req.session.customer.confirmation != "undefined") {
			var existingTimestamp = parseInt(req.session.customer.confirmation[0].timestamp);

			//get current timestamp
			var currentTimestamp = new Date().getTime();
			var timePassed = (currentTimestamp - existingTimestamp) / 1000;
			if (timePassed < 1800) {
				expired = false;
			}
		}

		//if the timestamp is > 30 mins, expire it by overwriting the customer confirmation obj with new token data
		if (expired) {
			//make a new token
			var confirmationTimestamp = new Date().getTime().toString();
			var digestKey = req.session.customer.email + confirmationTimestamp;
			var confirmationToken = wembliUtils.digest(digestKey);

			//save the token to the customer obj
			req.session.customer.confirmation = [{
				timestamp: confirmationTimestamp,
				token: confirmationToken
			}];
			req.session.customer.save();
		} else {
			console.log('token was not expired, using existing');
		}

		//send the email
		console.log('sending email...');
		//send a confirmation email
		/* TODO:
               - make the readfile async
               - make the html rendering use a layout
               - make the body text rendered from a template or maybe read from a file
            */


		//send a confirmation email
		var confirmLink = "http://" + app.settings.host + ".wembli.com/confirm";
		var emailEsc = encodeURIComponent(req.session.customer.email);
		var tokenEsc = encodeURIComponent(req.session.customer.confirmation[0].token);
		var confirmLinkEncoded = confirmLink + '/' + emailEsc + '/' + tokenEsc;

		res.render('email-templates/signup', {
			confirmLink: confirmLinkEncoded,
			layout: 'email-templates/layout',
			token: req.session.customer.confirmation[0].token,
		}, function(err, htmlStr) {

			var mail = {
				sender: '"Wembli Support" <help@wembli.com>',
				to: req.session.customer.email,
				headers: {
					'X-SMTPAPI': {
						category: "signup",
					}
				},
			};

			mail.subject = "Welcome to Wembli.com";
			//templatize this
			mail.text = 'Click here to confirm your email address: http://' + app.settings.host + '.wembli.com/confirm/' + encodeURIComponent(req.session.customer.email) + '/' + encodeURIComponent(req.session.customer.confirmation[0].token);
			mail.html = htmlStr;
			mailer.sendMail(mail, function(error, success) {
				console.log("Message " + (success ? "sent" : "failed:" + error));

				req.session.confirmEmailSent = {};
				if (error) {
					req.session.confirmEmailSent.emailError = true;
				} else {
					req.session.confirmEmailSent.resent = true;
				}

				return res.render('confirm-email-sent', {
					title: 'wembli.com - check your email!.'
				});

			});
		});
	});
}
