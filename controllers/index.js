var eventRpc = require('../rpc/event').event;
var wembliUtils = require('../lib/wembli/utils');
var async = require('async');
var redis = require("redis");
var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
    host: 'es01.wembli.com:9200'
});

module.exports = function(app) {

	function indexView(req, res, callback) {

		var view = {'concerts':[],'sports':[],'theater':[]};

		var client = redis.createClient(app.settings.redisport || 6379, app.settings.redishost || 'localhost', {});

		var zips = [];
		if (typeof req.session.visitor.tracking.nearby !== "undefined") {
			for (var i = req.session.visitor.tracking.nearby.zip_codes.length - 1; i >= 0; i--) {
				zips.push(req.session.visitor.tracking.nearby.zip_codes[i].zip_code);
			};
		}

		/* where clause for search */
		var daysPadding = 2; //how many days from today for the beginDate
		var d1 = Date.today();
		var d = new Date(d1);
		d.setDate(d1.getDate() + daysPadding);
		dateFmt = d.format("isoDateTime");
		var filters = [
      {
      	"range": {
        	"DateTime": {gte: dateFmt}
     		}
     	}
		];
		if (typeof zips[0] !== "undefined") {
    	filters.push({
      	"terms": {
        	"Zip":zips
      	}
      });
		}



		/* get concerts, sport and theater events in parallel */
		async.parallel([
			/* get 10 concerts nearby (categoryId: 2) */
			function(cb) {
				var f = [];
				for (var i = filters.length - 1; i >= 0; i--) {
					f.push(filters[i]);
				};

				f.push({
  				"term": {
  					"PCatID":2
  				}
  			});

				es.search({
				  index: 'ticket_network',
				  type:'events',
				  size:10,
				  body: {
				    "sort":[{"NumTicketsSold":{"order":"desc"}}],
				    "query": {
				      "filtered": {
				        "filter": {
				        	"and": f
						    }
				      },
				    },
				  }
				}).then(function (resp) {
					for (var i = resp.hits.hits.length - 1; i >= 0; i--) {
						view.concerts.push(resp.hits.hits[i]._source);
					};
					cb();

				}, function (error) {
					cb();
				});


				/*
				client.get('directory:top:/concerts-and-tour-dates', function(err, results) {
					if (results) {
						var r = JSON.parse(results);
						view.concerts = r.list.slice(0,10);
					} else {
						view.concerts = [];
					}
					cb();
				});
				*/
			},

			/* get 10 sports nearby (categoryId: 1) */
			function(cb) {
				var f = [];
				for (var i = filters.length - 1; i >= 0; i--) {
					f.push(filters[i]);
				};


				f.push({
  				"term": {
  					"PCatID":1
  				}
  			});
				es.search({
				  index: 'ticket_network',
				  type:'events',
				  size:10,
				  body: {
				    "sort":[{"NumTicketsSold":{"order":"desc"}}],
				    "query": {
				      "filtered": {
				        "filter": {
				        	"and": f
						    }
				      },
				    },
				  }
				}).then(function (resp) {
					for (var i = resp.hits.hits.length - 1; i >= 0; i--) {
						view.sports.push(resp.hits.hits[i]._source);
					};
					cb();

				}, function (error) {
					cb();
				});


				/*
				client.get('directory:top:/sports', function(err, results) {
					if (results) {
						var r = JSON.parse(results);
						view.sports = r.list.slice(0,10);
					} else {
						view.sports = [];
					}
					cb();
				});
				*/
			},

			/* get 10 theater nearby (categoryId: 3) */
			function(cb) {
				var f = [];
				for (var i = filters.length - 1; i >= 0; i--) {
					f.push(filters[i]);
				};


				f.push({
  				"term": {
  					"PCatID":3
  				}
  			});

				es.search({
				  index: 'ticket_network',
				  type:'events',
				  size:10,
				  body: {
				    "sort":[{"NumTicketsSold":{"order":"desc"}}],
				    "query": {
				      "filtered": {
				        "filter": {
				        	"and": f
						    }
				      },
				    },
				  }
				}).then(function (resp) {
					for (var i = resp.hits.hits.length - 1; i >= 0; i--) {
						view.theater.push(resp.hits.hits[i]._source);
					};
					cb();

				}, function (error) {
					cb();
				});


				/*
				client.get('directory:top:/performing-arts', function(err, results) {
					if (results) {
						var r = JSON.parse(results);
						view.theater = r.list.slice(0,10);
					} else {
						view.theater = [];
					}
					cb();
				});
				*/
			},

		], function(err, results) {
			callback(null, view);
		});
	};


	app.get(/^\/(index|features|faq|contact)?$/, function(req, res) {
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
