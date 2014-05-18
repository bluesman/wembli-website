var eventRpc = require('../rpc/event').event;
var wembliUtils = require('../lib/wembli/utils');
var async = require('async');
var redis = require("redis");

module.exports = function(app) {

	function indexView(req, res, callback) {

		var view = {};

		var client = redis.createClient(app.settings.redisport || 6379, app.settings.redishost || 'localhost', {});

		/* get concerts, sport and theater events in parallel */
		async.parallel([
			/* get 10 concerts nearby (categoryId: 2) */
			function(cb) {
				client.get('directory:top:/concerts-and-tour-dates', function(err, results) {
					if (results) {
						var r = JSON.parse(results);
						view.concerts = r.list.slice(0,10);
					} else {
						view.concerts = [];
					}
					cb();
				});
			},

			/* get 10 sports nearby (categoryId: 1) */
			function(cb) {
				client.get('directory:top:/sports', function(err, results) {
					if (results) {
						var r = JSON.parse(results);
						view.sports = r.list.slice(0,10);
					} else {
						view.sports = [];
					}
					cb();
				});
			},

			/* get 10 theater nearby (categoryId: 3) */
			function(cb) {
				client.get('directory:top:/performing-arts', function(err, results) {
					if (results) {
						var r = JSON.parse(results);
						view.theater = r.list.slice(0,10);
					} else {
						view.theater = [];
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
				theater: view.theater,
				jsIncludes:['/js/index.min.js']
			});
		});
	});

	app.get('/about-us', function(req, res) {
		res.render('about-us.jade', {
			title: 'wembli.com - About Us.',
			jsIncludes:['/js/index.min.js']
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

	app.get('/test-responsive', function(req, res) {
		res.render('test-responsive');
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
