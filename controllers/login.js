var querystring = require('querystring');
var async = require('async');
var wembliUtils = require('wembli/utils');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');

module.exports = function(app) {

	app.get('/login/social/?', function(req, res, next) {
		var r = '/dashboard';
		if (req.session.loginRedirect) {
			r = req.session.redirectUrl ? req.session.redirectUrl : r;

			delete req.session.redirectUrl;
			delete req.session.loginRedirect;
		}

		return res.redirect(r);
	});

	app.get('/login/?', function(req, res, next) {
		//clear out the form if they refresh
		delete req.session.loginForm;

		//if they try to load the login page while alredy logged in
		if (req.session.loggedIn) {
			//redirect to the dashboard
			return res.redirect((req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard'));
		}

		res.render('login2', {
			title: 'wembli.com - login to get the best seats.',
		});
	});

	app.post('/login/?', function(req, res) {

		req.session.remember  = req.param('remember');
		req.session.loginForm = {
			remember: req.param('remember'),
			email: req.param('email')
		};

		//validate email/password against the db
		Customer.findOne({email: req.param('email')}, function(err, c) {
			if ((err == null) && (c != null)) {
				//make a digest from the email
				var digest = wembliUtils.digest(req.param('password'));
				if (typeof c.password != "undefined" && c.password == digest) {
					req.session.loggedIn = true;
					req.session.customer = c;
					req.session.rememberEmail = c.email;

					var redirectUrl           = req.param('redirectUrl') ? req.param('redirectUrl') : req.session.redirectUrl;
					req.session.redirectUrl   = false;
					req.session.loginRedirect = false;
					delete req.session.loginForm;

					redirectUrl = redirectUrl ? redirectUrl : '/dashboard';

					return res.redirect(redirectUrl);
				}
			}

			//still here? then we failed
			req.session.loginForm.error = true;
			//render login on frame1
			res.render('login', {partial:true});
		}, false);


	});
};
