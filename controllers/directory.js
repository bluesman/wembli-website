var eventRpc = require('../rpc/event').event;
var wembliUtils = require('../lib/wembli/utils');
var async = require('async');
var redis = require("redis");
var ESClient = require('elasticsearchclient');
var es = new ESClient({
        hosts:[{
            host: 'es01.wembli.com',
            port: 9200
        }]
});

var eventRpc = require('../rpc/event').event;
var venueRpc = require('../rpc/venue').venue;
var performerRpc = require('../rpc/performer').performer;

module.exports = function(app) {
	/* this is another redis connection (there's already one in landing-pages.js maybe I should share */
	var client = redis.createClient(app.settings.redisport || 6379, app.settings.redishost || 'localhost', {});
	var prefix = 'directory:';


	/* example urls:
		- event directory -
		/events -> top level dir page for events: organize events by alpha, near you, top, category, ...
		/events/usa
		/events/usa/ca
		/events/usa/ca/san-diego
		/events/aa-ar
		/events/usa/as-bd
		/events/usa/ca/as-bd
		/events/usa/ca/san-diego/as-bd

		top:/events
		top:/events/<country>
		top:/events/<country>/<state>
		top:/events/<country>/<state>/<city>
		top:/events/<country>/<state>/<zip>

		alpha:/events => {aa-ar:150,as-bd:135, etc...}
		alpha:/events/<country> => {aa-ar:150,as-bd:135, etc...}
		alpha:/events/<country>/<state> => {aa-ar:150,as-bd:135, etc...}
		alpha:/events/<country>/<state>/<city> => {aa-ar:150,as-bd:135, etc...}
		alpha:/events/aa-ar -> list of events
		alpha:/events/<country>/aa-ar
		alpha:/events/<country>/<state>/aa-ar
		alpha:/events/<country>/<state>/<city>/aa-ar

		geo:/events
		geo:/events/<country>
		geo:/events/<country>/<state>

		- event detail -
		/events/chargers-vs-chiefs -> detail page lets customer choose how to split then sends them to tickets page

		- venue directory pages -
		/venues -> top 100 venues, list of countries with events, alpha trail
		/venues/usa -> top 100 venues, list of states
		/venues/usa/ca -> top 100 venues in ca, list of cities
		/venues/usa/ca/san-diego -> list of venues in san diego
		/venues/a-c
		/venues/usa/a-f
		/venues/usa/ca/a-f
		/venues/usa/ca/san-diego/a-f

		- venue detail pages -
		/venues/qualcomm-stadium -> detail page for a venue, lists events when clicked, overlay to choose split type then to tickets page
		/venues/qualcomm-stadium
		/venues/qualcomm-stadium#restaurants
		/venues/qualcomm-stadium#deals
		/venues/qualcomm-stadium#parking
		/venues/qualcomm-stadium#hotels

		/restaurants-near-qualcomm-stadium
		/hotels-near-qualcomm-stadium
		/parking-near-qualcomm-stadium
		/deals-near-qualcomm-stadium

		top:/venues => top 100 venues of all venues, if > 100 venues total: organize by alpha
		top:/venues/<country> => top max 100 venues by country, if > 100 venues total: organize by alpha
		top:/venues/<country>/<state> => top max 100 venues by state, if > 100 venues total: organize by alpha
		top:/venues/<country>/<state>/<city> => top max 100 venues for city, if > 100 venues total: organize by alpha
		top:/venues/<country>/<state>/<zip> => top max 100 venues by zip, if > 100 venues total: organize by alpha

		alpha:/venues => {"a-c":24,"d-h":50} (count of venues in each alpha range - should have even distribution using sq root or cube root)
		alpha:/venues/<country> => {"a-c":24,"d-h":50}
		alpha:/venues/<country>/<state> => {"a-c":24,"d-h":50}
		alpha:/venues/a-c => list of venues

		geo:/venues -> list of countries with venues that have events
		geo:/venues/<country>
		geo:/venues/<country>/<state>


		- performer -
		/san-diego-chargers -> performer detail page, lists events

		- category directory -
		/sports -> top sports performers & sports child categories
		/sports/tennis -> top tennis performers & tennis child categories, alpha trail
		/sports/tennis/professional -> performers with events upcoming in professional tennis
		/sports/tennis/a-d -> list performers
		/sports/tennis/e-h

		top:/<parent> => list of 100 performer slugs
		top:/<parent>/<child>
		top:/<parent>/<grandchild>
		alpha:/<parent>/<child> => {a-d:50,e-h:45, etc...}

		category:/
		category:/<parent> => list of all child categories
		category:/<parent>/<child>

	*/


	/* check for alpha trail
			- this url could be: venues in usa/ca/aa-ar
			- or it could be: venues in usa/ca/san-diego
			* check for city match first then check for alpha match
		*/

	/* this will always be a list view page which can have:
			- top venues in this category
			- alpha list
			- venues near you
			- top events sports|concert|theater at venues in these dirs
			- top performers sports|concert|theater at venues in these dirs
		*/

	/* add-ons
			- top deals near venue
			- best parking near venue
			- hotels near venue
			- sitters
		*/



	/* what data is in redis for a slug?
			{
				type: "venue",
				layout-style: "default",
				layout-id: "1",
				data-sets: ['countries','cities','states','top_venues','alpha_venues']
			}
	*/


	/* everything */
	app.get(/^\/(.+)$/, function(req, res) {
		req.syslog.notice('catchall: ' + req.params[0]);

		/* check slug in redis */
		var key = prefix + req.url;
		req.syslog.notice(key);

		client.get(key, function(err, obj) {
			if (err || !obj) {
				return notInRedis();
			}

			/* got a match - build the page */
			handlePage(obj);

			/* use the layout-style & layout-id to:
				- figure out the template to use
				- run the layout data getter
			*/

		});

		var run = {

		};

		function handlePage(obj) {

			/* fetch the data */
			console.log(obj);
			/* directory level pages will have no obj */
			obj = (obj === "true") ? "{}" : obj;
			obj = JSON.parse(obj);

			if (!obj.type) {
				obj.type = 'performers';
			}

			/* set up some defaults */
			if (!obj.layout) {
				obj.layout = {
					"style": "default",
					"id": 1,
					"type": "category"
				};
			}

			/* pick the right content template */
			obj.layout.type = (obj.type === 'performers') ? 'category' : 'geo';

			var locals = obj;

			/* TODO: handle title & meta */
			locals.meta = {
				title: "Tickets",
				description: "Get the best prices on tickets, parking, restaurants and hotels then split the cost with friends so you don't get stuck with the bill.",
			};

			var fetchKeys = {};
			/* list of countries */
			fetchKeys.rootGeoEvents = 'directory:geo:/events';
			/* list of countries */
			fetchKeys.rootGeoVenues = 'directory:geo:/venues';
			/* this of parent categories */
			fetchKeys.rootCategories = 'directory:category:/';
			/* top 100 performers, events or venues depending on url (could be by geo or category) */
			fetchKeys.top = 'directory:top:' + req.url;
			/* complete list of performers, events, venues by alpha */
			fetchKeys.alpha = 'directory:alpha:' + req.url;

			/* list of sub categories for this current category */
			if (obj.layout.type === 'category') {
				var categories = req.url.split('/');
				fetchKeys.childCategories = 'directory:category:/' + categories[1];
				if (categories[2]) {
					fetchKeys.grandChildCategories = 'directory:category:/' + categories[1] + '/' + categories[2];
				}
			}

			/* if we're looking at a venues directory, get the list of sub geo for the current geo for both venues and events */
			if (/\/venues/.test(req.url)) {
				fetchKeys.subGeoVenues = 'directory:geo:' + req.url;
				fetchKeys.subGeoEvents = 'directory:geo:' + req.url.replace('venues', 'events');
			}

			/* if we're looking at events directory, get the list of sub geo for the current geo for both venues and events */
			if (/\/events/.test(req.url)) {
				fetchKeys.subGeoEvents = 'directory:geo:' + req.url;
				fetchKeys.subGeoVenues = 'directory:geo:' + req.url.replace('events', 'venues');
			}

			var getData = [];
			getData.push(
				/* fetch the redis directory nav data */

				function(pCb) {
					async.forEach(Object.keys(fetchKeys),
						function(key, cb) {
							console.log('getting data set: ' + fetchKeys[key]);
							client.get(fetchKeys[key], function(err, result) {
								var data = JSON.parse(result);
								locals[key] = data;
								cb();
							});
						},

						function(err) {
							pCb(null);
						}
					);
				}
			);

			if (obj.id) {
				getData.push(
					/* fetch the detail page data */

					function(pCb) {
						console.log('fetch ' + obj.type + ' ' + obj.id);

						var fetchDetail = {

							'events': function(cb) {
								obj.layout.type = 'event';

								eventRpc['get'].apply(function(err, results) {
									console.log(err);
									console.log(results);
									obj.date = results.event[0].Date;
									obj.displayDate = results.event[0].DisplayDate;

									/* set the meta tags */
									locals.meta.title = 'Friends Split The Cost Of '+ obj.event +' Tickets';
									locals.meta.description = 'Get tickets for the upcoming ' + obj.performer + ' event: "' + obj.event + '" on Wembli.  Then, find parking, restaurants and hotels near '+obj.venue+'. Split the cost of everything with friends so you don\'t get stuck with the bill.';

									cb();
								}, [{"eventID":obj.id}, req, res]);

							},

							'venues': function(cb) {
								obj.layout.type = 'venue';
								console.log('venue id: '+ obj.id);
								venueRpc['get'].apply(function(err, results) {
									console.log('GET VENUE DETAILS');
									console.log(err);
									console.log(results);

									/* just take the first venue */
									obj.venue = results.venue[0];

						  		obj.slugs = {};
						  		obj.slugs.country = wembliUtils.slugify(obj.venue.Country);
						  		obj.slugs.state = wembliUtils.slugify(obj.venue.StateProvince);
						  		obj.slugs.city = wembliUtils.slugify(obj.venue.City);


									/* get venue configurations */
									venueRpc['getConfigurations'].apply(function(e2, configs) {
										console.log('get configs: ');
										console.log(configs);
										obj.venue.configurations = configs.venue;

										eventRpc['get'].apply(function(e3,events) {
											console.log('EVENTS');
											console.log(events);
											obj.venue.events = events.event;

											locals.meta.title = 'Cheap Tickets For Events at '+obj.venue.name;
											locals.meta.description = 'Get tickets for upcoming events at: "' + obj.venue.name + '" on Wembli.  Then, find parking, restaurants and hotels and split the cost of everything with friends so you don\'t get stuck with the bill.';

											cb();

										}, [{"venueID":parseInt(obj.id)}, req, res]);
									}, [{"VenueID":parseInt(obj.id)}, req, res]);
								}, [{"VenueID":parseInt(obj.id)}, req, res]);
							},

							'performers': function(cb) {

								obj.layout.type = 'performer';

								es.search('ticket_network', 'performers', {"query":{"term":{"PerformerID":obj.id}}}, function(err, data) {
						  		obj.performer = JSON.parse(data).hits.hits[0]._source;

									/* tn misspelled their performer name header */
						  		if (obj.performer.PeformerName) {
						  			obj.performer.PerformerName = obj.performer.PeformerName;
						  		}

						  		if (obj.performer.ParentCategory === 'SPORTS') {
						  			obj.layout.type = 'team';
						  		}

						  		obj.slugs = {};
						  		obj.slugs.pcat = wembliUtils.slugify(obj.performer.ParentCategory);
						  		obj.slugs.ccat = wembliUtils.slugify(obj.performer.ChildCategory);
						  		obj.slugs.gcat = wembliUtils.slugify(obj.performer.GrandChildCategory);


									eventRpc['get'].apply(function(err, results) {
										console.log(err);
										console.log(results);
										obj.performer.events = results.event;

										locals.meta.title = 'Friends Split The Cost Of '+ obj.performer.PerformerName +' Tickets';
										locals.meta.description = 'Get tickets for upcoming ' + obj.performer + ' events on Wembli.  Then, find parking, restaurants and hotels near the venue. Split the cost of everything with friends so you don\'t get stuck with the bill.';


										cb();

									}, [{"performerID":obj.id}, req, res]);


								});

							}

						}
						fetchDetail[obj.type](pCb);
					}
				);
			}

			/* get data sets - can this be done as a pipeline? */
			async.parallel(getData, function(err, results) {
				console.log(obj);
				/* make the template from the layout style and layout id */
				var template = 'directory/' + obj.layout.style + '/' + obj.layout.id + '/' + obj.layout.type;
				console.log("render template: " + template);
				console.log(locals);
				res.render(template, locals);
			});
		}

		function notInRedis() {

			/* not in redis, do a search (don't redirect) */
			var str = req.params[0].replace(/^\//, '');
			var q = str.replace(/-/gi, ' ');
			res.redirect("/search/events?search=" + q);

			/* no search results? show a nice 404 */

		};
	});

};
