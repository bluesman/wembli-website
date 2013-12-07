var eventRpc = require('../rpc/event').event;
var wembliUtils = require('../lib/wembli/utils');
var async = require('async');
var redis = require("redis");

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

		var client = redis.createClient(app.settings.redisport || 6379, app.settings.redishost || 'localhost', {});


		/* get concerts, sport and theater events in parallel */
		async.parallel([
			/* get 10 concerts nearby (categoryId: 2) */
			function(cb) {
				client.get('directory:top:/concerts', function(err, results) {
					console.log('top concerts performers');
					if (results) {
						view.concerts = JSON.parse(results).slice(0,10);
					}
					cb();
				});
			},

			/* get 10 sports nearby (categoryId: 1) */
			function(cb) {
				client.get('directory:top:/sports', function(err, results) {
					console.log('top sports performers');
					if (results) {
						view.sports = JSON.parse(results).slice(0,10);
					}
					cb();
				});
			},

			/* get 10 theater nearby (categoryId: 3) */
			function(cb) {
				client.get('directory:top:/theater', function(err, results) {
					console.log('top sports performers');
					if (results) {
						view.theater = JSON.parse(results).slice(0,10);
					}
					cb();
				});
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
				theater: view.theater
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
