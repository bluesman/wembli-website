var wembliUtils = require('wembli/utils');
var wembliMail = require('../lib/wembli/email');
var wembliModel = require('../lib/wembli-model');
var Customer = wembliModel.load('customer');

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

  app.get('/forgot-password', function(req, res) {
		res.render('forgot-password', {
			jsIncludes: ['/js/login.min.js']
		});
  });

	app.get(/\/reset-password\/(.*?)\/(.*)\/?/, function(req, res) {
		Customer.findOne({
			email: req.params[0]
		}, function(err, c) {
			if (c == null) {
				//TODO: wonky
				return res.redirect('/forgot-password');
			}

			if (typeof c.forgotPassword[0] == "undefined") {
				//no crystal
				var r = req.param('next') ? decodeURIComponent(req.param('next')) : '/dashboard';
				return res.redirect(r);
			}

			//check if this token is expired
			var dbTimestamp = c.forgotPassword[0].timestamp;
			var currentTimestamp = new Date().getTime();
			var timePassed = (currentTimestamp - dbTimestamp) / 1000;
			//has it been more than 2 days?
			if (timePassed > 172800) {
				//token is expired - handle this better someday
				return res.redirect('/forgot-password');
			}

			//all good - let them enter a new password
			return res.render('supply-password', {
				email: c.email,
				token: c.forgotPassword[0].token,
				redirectUrl: decodeURIComponent(req.param('next')),
				jsIncludes: ['/js/login.min.js']
			});
		});
	});

};
