var eventRpc = require('../rpc/event').event;
var wembliUtils = require('../lib/wembli/utils');
var async = require('async');

module.exports = function(app) {

	/* san-diego-chargers */
	app.get('/san-diego-chargers', function(req, res) {
		res.render('landing-pages/san-diego-chargers', {});
	});

	app.get('/partials/san-diego-chargers', function(req, res) {
		res.render('partials/landing-pages/san-diego-chargers', {});
	});

	/* george-straight */
	app.get('/george-strait', function(req, res) {
		res.render('landing-pages/george-strait', {});
	});

	app.get('/partials/george-strait', function(req, res) {
		res.render('partials/landing-pages/george-strait', {});
	});


	/* generic landing pages */
	var landingPageUrl = ['/concert-tickets','/sports-tickets','/theater-tickets'];

	var run = {
		'search': {
			'1': function(req, res, render) {
				var me = this;
				var cb = function(err, view) {
					this.topEvents = view;
					render(me);
				}
				fetchTopEvents(req, res, cb);
			}
		}
	}

	/* store this in redis eventually, populated by google spreadsheet importer */
	var landingPageData = {
		'/concert-tickets': {
			'URL': '/concert-tickets',
			'LAYOUT': '/search/1',
			'section':[
				{},
				{
					'carousel':['concert-1.jpg'],
				},
				{
					'h1':["BUY TICKETS TO YOUR FAVORITE CONCERTS","INVITE FRIENDS WITHOUT GETTING STUCK WITH THE BILL"],
				},
				{},
				{
					'h2':["CONCERT + FRIENDS - PAY = HAPPY"],
					'copy':['Going to concerts with friends is amazing - getting stuck footing the bill - or having to chase them down after the fact is lame!','We hear your pain and we\'re making it uber simple to go to concerts with friends.  Forget scouring the web for tickets - Wembli does it for you!  Find what you like, choose add-ons, invite your friends and buy online. Tickets come straight to your house or inbox.  No sweat!'],
				}
			],
			run: run['search']['1']
		},

		'/sports-tickets': {
			'URL': '/sports-tickets',
			'LAYOUT': '/search/1',
			'section':[
				{},
				{
					'carousel':['sport-1.jpg'],
				},
				{
					'h1':["BUY SPORTS TICKETS ONLINE","INVITE FRIENDS WITHOUT GETTING STUCK WITH THE BILL"],
				},
				{},
				{
					'h2':["GAME + FRIENDS - BILL = SCORE"],
					'copy':['Going to games with friends is amazing - getting stuck footing the bill - or having to chase them down after the fact is lame!','We hear your pain and we\'re making it stupid simple to go to  with friends.  Forget scouring the web for tickets - Wembli does it for you!  Find what you like, choose add-ons, invite your friends and buy online. Tickets come straight to your house or inbox.  No sweat!','Professional & college football, basketball, hockey, baseball!'],
				}
			],
			run: run['search']['1']
		},

		'/theater-tickets': {
			'URL': '/theater-tickets',
			'LAYOUT': '/search/1',
			'section':[
				{},
				{
					'carousel':['theater-1.jpg'],
				},
				{
					'h1':["BUY THEATER TICKETS ONLINE","INVITE FRIENDS WITHOUT GETTING STUCK WITH THE BILL"],
				},
				{},
				{
					'h2':["THEATER + FRIENDS - BILL = JOY"],
					'copy':['Going to the theater with friends is amazing - getting stuck footing the bill - or having to chase them down after the fact is lame!','We hear your pain and we\'re making it simple to go to live events with friends.  Forget scouring the web for tickets - Wembli does it for you!  Find what you like, choose add-ons, invite your friends and buy online. Tickets come straight to your house or inbox.  Well played!','Musicals, drama, ballet, comedy.'],
				}
			],
			run: run['search']['1']
		},
	};

	async.forEach(landingPageUrl, function(el,cb) {

		app.get(el, function(req, res) {

			handleLandingPage(el, '', req, res);

		});

		app.get('/partials'+el, function(req, res) {

			handleLandingPage(el, 'partials/', req, res);

		});

	},
	function(err, result) {
		/* done setting up gets for landing pages */
	});

	function handleLandingPage(key, tmplPrefix, req, res) {
		/* get landing page data for this slug from redis
				- layout
		*/

		var lp = landingPageData[key];

		var render = function(locals) {

			var template = tmplPrefix + 'landing-pages' + lp['LAYOUT'];
			res.render(template, locals);

		};

		lp.run(req, res, render);

	};

	function fetchTopEvents(req, res, callback) {
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
					view.concerts = ((typeof results !== "undefined") && (typeof results.event !== "undefined")) ? results.event : [];
					cb();
				}, [args, req, res]);
			},

			/* get 10 sports nearby (categoryId: 1) */
			function(cb) {
				var args = defaults;
				args.parentCategoryID = 1;
				eventRpc['get'].apply(function(err, results) {
					view.sports = ((typeof results !== "undefined") && (typeof results.event !== "undefined")) ? results.event : [];
					cb();
				}, [args, req, res]);
			},

			/* get 10 theater nearby (categoryId: 3) */
			function(cb) {
				var args = defaults;
				args.parentCategoryID = 3;
				eventRpc['get'].apply(function(err, results) {
					view.theater = ((typeof results !== "undefined") && (typeof results.event !== "undefined")) ? results.event : [];
					cb();
				}, [args, req, res]);
			},

		], function(err, results) {
			callback(null, view);
		});
	};




};

