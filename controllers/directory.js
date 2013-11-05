var eventRpc = require('../rpc/event').event;
var wembliUtils = require('../lib/wembli/utils');
var async = require('async');
var redis = require("redis");

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

		top_events:/events
		top_events:/events/<country>
		top_events:/events/<country>/<state>
		top_events:/events/<country>/<state>/<city>
		top_events:/events/<country>/<state>/<zip>

		alpha_events:/events => {aa-ar:150,as-bd:135, etc...}
		alpha_events:/events/<country> => {aa-ar:150,as-bd:135, etc...}
		alpha_events:/events/<country>/<state> => {aa-ar:150,as-bd:135, etc...}
		alpha_events:/events/<country>/<state>/<city> => {aa-ar:150,as-bd:135, etc...}
		alpha_events:/events/aa-ar -> list of events
		alpha_events:/events/<country>/aa-ar
		alpha_events:/events/<country>/<state>/aa-ar
		alpha_events:/events/<country>/<state>/<city>/aa-ar

		countries:/events
		states:/events/<country>
		cities:/events/<country>/<state>

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

		top_venues:/venues => top 100 venues of all venues, if > 100 venues total: organize by alpha
		top_venues:/venues/<country> => top max 100 venues by country, if > 100 venues total: organize by alpha
		top_venues:/venues/<country>/<state> => top max 100 venues by state, if > 100 venues total: organize by alpha
		top_venues:/venues/<country>/<state>/<city> => top max 100 venues for city, if > 100 venues total: organize by alpha
		top_venues:/venues/<country>/<state>/<zip> => top max 100 venues by zip, if > 100 venues total: organize by alpha

		alpha_venues:/venues => {"a-c":24,"d-h":50} (count of venues in each alpha range - should have even distribution using sq root or cube root)
		alpha_venues:/venues/<country> => {"a-c":24,"d-h":50}
		alpha_venues:/venues/<country>/<state> => {"a-c":24,"d-h":50}
		alpha_venues:/venues/a-c => list of venues

		countries:/venues -> list of countries with venues that have events
		states:/venues/<country>
		cities:/venues/<country>/<state>


		- performer -
		/san-diego-chargers -> performer detail page, lists events

		- category directory -
		/sports -> top sports performers & sports child categories
		/sports/tennis -> top tennis performers & tennis child categories, alpha trail
		/sports/tennis/professional -> performers with events upcoming in professional tennis
		/sports/tennis/a-d -> list performers
		/sports/tennis/e-h

		top_performers:/<parent> => list of 100 performer slugs
		top_performers:/<parent>/<child>
		top_performers:/<parent>/<grandchild>
		alpha_performers:/<parent>/<child> => {a-d:50,e-h:45, etc...}
		sub_category:/<parent> => list of all child categories
		sub_category:/<parent>/<child>

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
		var key = prefix + req.params[0];
		client.hgetall(key, function(err, obj) {
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

			/* make the template from the layout style and layout id */
			var template = 'directory/' + obj['layout-style'] + '/' + obj['layout-id'] + '/' + obj['type'];
			res.render(template, locals);
		};

		function notInRedis() {

			/* not in redis, do a search (don't redirect) */
			var str = req.params[0].replace(/^\//, '');
			var q = str.replace(/-/gi, ' ');
			res.redirect("/search/events?search=" + q);

			/* no search results? show a nice 404 */

		};
	});

};
