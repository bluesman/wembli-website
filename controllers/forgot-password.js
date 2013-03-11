var wembliUtils = require('wembli/utils');
var wembliMail  = require('../lib/wembli/email');
var wembliModel = require('../lib/wembli-model');
var Customer    = wembliModel.load('customer');

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

	app.get(/\/reset-password\/(.*?)\/(.*)\/?/, function(req, res) {
		Customer.findOne({
			email: req.params[0]
		}, function(err, c) {
			if (c == null) {
				//TODO: wonky
				return res.redirect('/');
			}

			if (typeof c.forgotPassword[0] == "undefined") {
				//no crystal
				return res.redirect('/');
			}

			//check if this token is expired
			var dbTimestamp = c.forgotPassword[0].timestamp;
			var currentTimestamp = new Date().getTime();
			var timePassed = (currentTimestamp - dbTimestamp) / 1000;
			//has it been more than 2 days?
			if (timePassed > 172800) {
				//token is expired - handle this better someday
				return res.redirect('/');
			}

			//all good - let them enter a new password
			return res.render('supply-password', {
				title: 'wembli.com - reset password',
				email: c.email,
				token: c.forgotPassword[0].token,
			});
		});
	});

	app.post('/reset-password', function(req, res) {
		//make sure pass1 and pass2 are ==
		if (req.param('password') != req.param('password2')) {
			return res.render('supply-password', {
				title: 'wembli.com - reset password',
				email: req.param('email'),
				token: req.param('token'),
			});
		}

		//validate email and token again
		Customer.findOne({email: req.param('email')}, function(err, c) {
			if (c == null) {
				//TODO: wonky
				return res.redirect('/');
			}

			if (typeof c.forgotPassword == "undefined") {
				//no crystal
				return res.redirect('/');
			}

			//check if this token is expired
			var dbTimestamp = c.forgotPassword[0].timestamp;
			var currentTimestamp = new Date().getTime();
			var timePassed = (currentTimestamp - dbTimestamp) / 1000;
			//has it been more than 2 days?
			if (timePassed > 172800) {
				//token is expired - handle this better someday
				return res.redirect('/');
			}

			//make sure the passed in token matches the db token
			if (req.param('token') != c.forgotPassword[0].token) {
				return res.redirect('/');
			}

			var password = wembliUtils.digest(req.param('password'));
			var forgotPassword = [];
			c.update({forgotPassword: [], password:password}, function(err) {
				//log em in
				req.session.loggedIn = true;
				req.session.customer = c;
				res.redirect('/dashboard');
			});
		});
	});


	app.post('/forgot-password', function(req, res) {
		if (!req.param('email')) {
			//no crystal - make this better someday
			return res.redirect('/');
		}

		if ((typeof req.session.loggedIn != "undefined") && req.session.loggedIn) {
			//retard is already logged in
			return res.redirect('/dashboard');
		}

		Customer.findOne({email: req.param('email')}, function(err, c) {
			if (c == null) {
				/* clear out any existing customer (logout doesn't do this by design */
				delete req.session.customer;
				//TODO: fix this - they tried to give us an email for an account that doesn't exist
				return res.redirect('/');
			}

			var noToken = true;

			/* have a c, make a forgot password token (or if there is already one in the db that is not expired, use it) */
			if (typeof c.forgotPassword[0] != "undefined") {
				/* check if this token is expired */
				var dbTimestamp      = c.forgotPassword[0].timestamp;
				var currentTimestamp = new Date().getTime();
				var timePassed       = (currentTimestamp - dbTimestamp) / 1000;
				//has it been more than 2 days?
				var noToken = (timePassed < 172800) ? false : true;
			}

			if (noToken) {
				//make a new token
				var tokenTimestamp = new Date().getTime().toString();
				var tokenHash      = wembliUtils.digest(req.param('email') + tokenTimestamp);
			} else {
				//use the existing token
				var tokenHash      = c.forgotPassword[0].token;
				var tokenTimestamp = c.forgotPassword[0].timestamp;
			}

			var forgotPassword = [{
				timestamp: tokenTimestamp,
				token: tokenHash
			}];

			c.update({forgotPassword:forgotPassword},function(err) {
				if (err) {	return res.redirect('/');	}

				var args = {
					res:res,
					tokenHash:tokenHash,
					customer:c
				}
				wembliMail.sendForgotPasswordEmail(args)

				/* load check your email page */
				return res.render('reset-password-sent', {
					title: 'wembli.com - reset password email sent',
					email: req.param('email'),
				});
			});
		});
	});
};
