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
		/* if they try to load the login page while alredy logged in */
		if (req.session.loggedIn) {
			/* redirect to the dashboard */
			return res.redirect((req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard'));
		}

		res.render('login', {
			jsIncludes: ['/js/login.min.js']
		});
	});

};
