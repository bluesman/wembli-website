var eventRpc = require('../rpc/event').event;
var wembliUtils = require('../lib/wembli/utils');
var async = require('async');
var redis = require("redis");
var elasticsearch= require('elasticsearch');
var es = new elasticsearch.Client({
		host: 'es01.wembli.com:9200'
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


		function handlePage(obj) {

			/* fetch the data */
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

			/* TODO: handle title & meta */
			obj.meta = {
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
							console.log('fetching: '+fetchKeys[key]);
							client.get(fetchKeys[key], function(err, result) {
								var data = JSON.parse(result);
								obj[key] = data;
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
						var fetchDetail = {

							'events': function(cb) {

								obj.layout.type = 'event';

								/* get this event, venue and performers from ES */
								var docs = [
										{"_index":"eventful", "_type": "events", "_id": obj.id},
										{"_index":"eventful", "_type": "venues", "_id": obj.venueId},
								];
								if (obj.performerIds) {
									obj.performerIds.forEach(function(p) {
										docs.push({"_index":"eventful", "_type": "performers", "_id": p.performer.id});
									});
								}

								es.mget({body: {docs: docs}}, function(err, data) {
									if (err) {
										/* TODO: render the not found page */
									}

									data.docs.forEach(function(el) {
										if (el._type === 'events' && el.exists) {
											obj.event = el._source;
										}
										if (el._type === 'venues' && el.exists) {
											obj.venue = el._source;
										}
										if (el._type === 'performers' && el.exists) {
											if (typeof obj.performers === "undefined") {
												obj.performers = [];
											}
											obj.performers.push(el._source);
										}
									});

									obj.slugs = {};
									obj.slugs.country = wembliUtils.slugify(obj.venue.country);
									obj.slugs.region = wembliUtils.slugify(obj.venue.region);
									obj.slugs.city = wembliUtils.slugify(obj.venue.city);
									obj.slugs.venue = wembliUtils.slugify(obj.venue.name);
									obj.slugs.category = wembliUtils.slugify(obj.event.categories.category.name);

									if (typeof obj.event.subcategories.subcategory !== "undefined") {
										obj.slugs.subcategory = wembliUtils.slugify(obj.event.subcategories.subcategory.short_name);
									}
									/* set the meta tags */
									obj.meta.title = 'Friends Split The Cost Of ' + obj.event.title + ' Tickets';
									/* TODO: get performer & venue from ES */
									/* obj.meta.description = 'Get tickets for the upcoming ' + obj.event.performers[0].name + ' event: "' + obj.event.title + '" on Wembli.  Then, find parking, restaurants and hotels near ' + obj.venue.name + '. Split the cost of everything with friends so you don\'t get stuck with the bill.';
									*/
									cb();
								});

							},

							'venues': function(cb) {
								obj.layout.type = 'venue';

								/* get the venue and a list of events */
								es.get({index:"eventful",type:"venues",id:obj.id},function(err, venue) {
									if (err) {
										/* TODO: render the not found page */
									}
									obj.venue = venue._source;
									/* now get the events, parking and restaurants for this venue */
									async.parallel([
										/* get eventlist from es */
										function(venueGetDetailCb) {
											es.search({index:'eventful',type:'events',size:20,q:'venue_id:'+venue._source.id}, function(err, result) {
												obj.venue.events = result.hits.hits;
												venueGetDetailCb();
											});
										},

									], function(err, results) {
										obj.slugs = {};
										obj.slugs.country = wembliUtils.slugify(obj.venue.country);
										obj.slugs.region = wembliUtils.slugify(obj.venue.region);
										obj.slugs.city = wembliUtils.slugify(obj.venue.city);
										obj.slugs.venue = wembliUtils.slugify(obj.venue.name);

										//obj.meta.title = 'Cheap Tickets For Events at ' + obj.venue.Name;
										//obj.meta.description = 'Get tickets for upcoming events at: "' + obj.venue.Name + '" on Wembli.  Then, find parking, restaurants and hotels and split the cost of everything with friends so you don\'t get stuck with the bill.';
										cb();
									});

								});
							},

							'performers': function(cb) {

								obj.layout.type = 'performer';

								/* get the performer and a list of events */
								es.get({index:"eventful",type:"performers",id:obj.id},function(err, performer) {
									if (err) {
										/* TODO: render the not found page */
										console.log(err);
									}

									console.log(performer);

									obj.performer = performer._source;
									/* now get the events, parking and restaurants for this venue */
									async.parallel([
										/* get eventlist from es */
										function(venueGetDetailCb) {
											console.log(performer)
											es.search({index:'eventful',type:'events',size:20,q:'performers.performer.id:'+performer._source.id}, function(err, result) {
												obj.performer.events = result.hits.hits;
												venueGetDetailCb();
											});
										},

									], function(err, results) {

										if (obj.categories[0].category.name === 'sports') {
											obj.layout.type = 'team';
										}

										obj.slugs = {};
										obj.slugs.category    = wembliUtils.slugify(obj.categories[0].category.name);
										if (obj.categories[0].subcategory) {
											obj.slugs.subcategory = wembliUtils.slugify(obj.categories[0].subcategory.short_name);
										}

										obj.meta.title = 'Friends Split The Cost Of ' + obj.performer.name + ' Tickets';
										obj.meta.description = 'Get tickets for upcoming ' + obj.performer.name + ' events on Wembli.  Then, find parking, restaurants and hotels near the venue. Split the cost of everything with friends so you don\'t get stuck with the bill.';

										cb();
									});

								});

							}

						}
						fetchDetail[obj.type](pCb);
					}
				);
			}

			/* get data sets - can this be done as a pipeline? */
			async.parallel(getData, function(err, results) {
				/* make the template from the layout style and layout id */
				var template = 'directory/' + obj.layout.style + '/' + obj.layout.id + '/' + obj.layout.type;
				var sortFunc = function(a, b) {
					if (a.name < b.name) return -1;
					if (a.name > b.name) return 1;
					return 0;
				}
				if (obj.top) {
					obj.top.list = obj.top.list.sort(sortFunc);
				}
				if (obj.subGeoEvents) {
					obj.subGeoEvents = obj.subGeoEvents.sort(sortFunc);
				}
				if (obj.subGeoVenues) {
					obj.subGeoVenues = obj.subGeoVenues.sort(sortFunc);
				}
				res.render(template, obj);
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
