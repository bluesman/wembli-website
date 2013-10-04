var eventRpc = require('../rpc/event').event;
var wembliUtils = require('../lib/wembli/utils');
var async = require('async');

module.exports = function(app) {

	function indexView(req, res, callback) {
		var defaults = {
			beginDate: wembliUtils.searchBeginDate(),
			orderByClause: 'Date',
			numberOfEvents: 10
		};

		if (typeof req.session.visitor.tracking.postalCode != "undefined") {
			defaults.nearZip = req.session.visitor.tracking.postalCode;
		}

		var view = {};
		/* get concerts, sport and theater events in parallel */
		async.parallel([
			/* get 10 concerts nearby (categoryId: 2) */
			function(cb) {
				var args = defaults;
				args.parentCategoryID = 2;
				eventRpc['get'].apply(function(err, results) {
					view.concerts = (typeof results.event !== "undefined") ? results.event : [];
					cb();
				}, [args, req, res]);
			},

			/* get 10 sports nearby (categoryId: 1) */
			function(cb) {
				var args = defaults;
				args.parentCategoryID = 1;
				eventRpc['get'].apply(function(err, results) {
					view.sports = (typeof results.event !== "undefined") ? results.event : [];
					cb();
				}, [args, req, res]);
			},

			/* get 10 theater nearby (categoryId: 3) */
			function(cb) {
				var args = defaults;
				args.parentCategoryID = 3;
				eventRpc['get'].apply(function(err, results) {
					view.theater = (typeof results.event !== "undefined") ? results.event : [];
					cb();
				}, [args, req, res]);
			},

		], function(err, results) {
			callback(null, view);
		});
	};


	app.get(/^\/(index)?$/, function(req, res) {
		indexView(req, res, function(err, view) {
			res.render('index', {
				concerts: view.concerts,
				sports: view.sports,
				theater: view.theater,

			});
		});
	});


	app.get('/partials/index', function(req, res) {
		indexView(req, res, function(err, view) {
			res.render('partials/index', {
				concerts: view.concerts,
				sports: view.sports,
				theater: view.theater
			});
		});
	});

	app.get('/about-us', function(req, res) {
		res.render('about-us.jade', {
			title: 'wembli.com - About Us.'
		});

	});

	app.get('/terms-policies', function(req, res) {
		res.render('terms-policies.jade', {
			title: 'wembli.com - Terms & Policies.'
		});

	});

	app.get('/test-angular', function(req, res) {
		res.render('test-angular');
	});


	app.get('/style-guide', function(req, res) {
		res.render('style-guide.jade', {
			title: 'wembli.com - we got style yo!'
		});
	});

	app.get('/email/:template', function(req, res) {
		var argsMap = {
			'forgot-password': {
				resetLink: '#',
			},
			'welcome': {

			},
			'signup': {
				confirmLink: '#',
			},
			'rsvp': {
				rsvpDate: Date.today(),
				rsvpLink: '#',
				message: "hey man come join me at this event - it'll be a blast",
			}

		};

		return res.render('email-templates/' + req.param('template'), argsMap[req.param('template')]);

	});

};
