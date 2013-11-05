var fs = require('fs');
var csv = require('csv');
var redis = require('redis');
var http = require('http');
var https = require('https');
var async = require('async');

var argv = require('optimist')
	.usage('\nImport a csv containing meta tag data for urls.\n\nUsage: $0 <file|"url">\n\n*note: if using a url - be sure to put quotes around it.')
	.
default ('p', 6379)
	.describe('p', 'redis port')
	.alias('p', 'port')
	.
default ('h', 'localhost')
	.describe('h', 'redis host')
	.alias('h', 'host')
	.
default ('a', 'meta-tag')
	.describe('a', 'prefix redis key to namespace your data')
	.alias('a', 'prefix')
	.demand(1)
	.argv;

var client = redis.createClient(argv.p, argv.h, {});

console.log('process file: ' + argv._[0]);

var topVenue = {};
var topEvent = {};
var topPerformer = {};

/* this is the function that does all the work */

/* performer file header */
/*
 * PerformerID
 * PeformerName
 * ParentCategoryID
 * ParentCategory
 * ChildCategoryID
 * ChildCategory
 * GrandChildCategoryID
 * GrandChildCategory
 * NumOrders
 * NumTicketsSold
 *
 */

/* event file header
 * EventID
 * Event
 * PerformerID
 * Performer
 * Venue
 * VenueID
 * VenueStreetAddress
 * DateTime
 * PCatID
 * PCat
 * CCatID
 * CCat
 * GCatID
 * GCat
 * City
 * State
 * StateID
 * Country
 * CountryID
 * Zip
 * TicketsYN
 * MinPrice
 * MaxPrice
 * IMAGEURL
 * URLLink
 * NumOrders
 * NumTicketsSold
 * EventUpdateDate
 * HasInteractiveMap
 */

function handleRow(row, next) {
	/* foreach row:
	 * make slugs for event, venue, performer, country, city, state, parent, child, grandchild
	 * make urls
	 * organize countries, cities, states, sub_category, top_venues, top_events, top_performers, alpha_venues, alpha_events, alpha_performers
	 */

	/* if row ticketsyn == 'N' then next */
	if (row['ticketsyn'] === 'N') {
		next();
	}

	var slugs = {};
	var keys = ['event', 'performer', 'venue', 'pcat', 'ccat', 'gcat', 'country', 'state', 'city'];
	async.forEachSeries(keys, function(k, cb) {
		slugs[k] = makeSlug(row[k]);
		cb();
	}, function(err) {
		/* make urls */

		/*
		 * - detail: /key/slug => row
		 *
		 * - events and venues get dires by geo
		 * - geo1: /key/country => true
		 * - geo2: /key/country/state
		 * - geo3: /key/country/state/city
		 *
		 * - performers get dirs by category
		 * - pcat: /pcat
		 * - ccat: /pcat/ccat
		 * - gcat: /pcat/ccat/gcat
		 */

		if (slugs['venue']) {
			var venue1 = '/venue';
			var venueDetail = '/venue/' + slugs['venue'];
			store(venueDetail,row);
			if (slugs['country']) {
				var venueGeo1 = '/venue/' + slugs['country'];
				store(venueGeo1,true);
				if (slugs['state']) {
					var venueGeo2 = venueGeo1 + '/' + slugs['state'];
					store(venueGeo2,true);
					if (slugs['city']) {
						var venueGeo3 = '/venue/' + slugs['country'] + '/' + slugs['state'] + '/' + slugs['city'];
						store(venueGeo3,true);
					}
				}
			}
		}

		if (slugs['performer']) {
			var performerDetail = '/' + slugs['performer'];
			store(performerDetail, row);
			if(slugs['pcat'] && (slugs['pcat']) !== '-') {
				var pcat = '/' + slugs['pcat'];
				store(pcat, true);
				if(slugs['ccat'] && (slugs['ccat']) !== '-') {
					var ccat = '/' + slugs['pcat'] + '/' + slugs['ccat'];
					store(ccat, true);
					if(slugs['gcat'] && (slugs['gcat']) !== '-') {
						var gcat = '/' + slugs['pcat'] + '/' + slugs['ccat'] + '/' + slugs['gcat'];
						store(gcat, true);
					}
				}
			}
		}

		if (slugs['event']) {
			var event1 = '/event';
			var eventDetail = '/event/' + slugs['event'];
			store(eventDetail, row);
			if (slugs['country']) {
				var eventGeo1 = '/event/' + slugs['country'];
				store(eventGeo1, true);
				if (slugs['state']) {
					var eventGeo2 = '/event/' + slugs['country'] + '/' + slugs['state'];
					store(eventGeo2, true);
					if (slugs['city']) {
						var eventGeo3 = '/event/' + slugs['country'] + '/' + slugs['state'] + '/' + slugs['city'];
						store(eventGeo3, true);
					}
				}
			}
		}



		/* count some stuff
		 * top venues - most events?
		 * top events - most ticket volume
		 * top performers
		 * list of states per country
		 * list of cities per state
		 * list of ccat per pcat
		 * list of gcat per ccat

  minprice: '.000000',
  maxprice: '.000000',
  numorders: '0',
  numticketssold: '0',

		*/

		/* most events */
		var score = parseInt(row['numorders']) + parseInt(row['numticketssold']);

		topVenue[slugs['venue']]     = topVenue[slugs['venue']] ? topVenue[slugs['venue']] + score : score;
		topPerformer[slugs['event']] = topPerformer[slugs['event']] ? topPerformer[slugs['event']] + score : score;
		topEvent[slugs['performer']] = topEvent[slugs['performer']] ? topEvent[slugs['performer']] + score : score;

		next();

	});
};

function store(key, val) {
	//console.log(key);
}

function makeSlug(str) {
	/* lowercase, sub spaces for dash, no more than 1 dash in a row,  */
	var slug = str.toLowerCase().replace(/\W/g, ' ');
	slug = slug.replace(/\s\s*/g, '-');
	/* no - at beginning or end */
	slug = slug.replace(/^-/,'');
	slug = slug.replace(/-$/,'');
	return slug;
}

if (/^http/.test(argv._[0])) {
	streamCsv(argv._[0], parseCsv);
} else {
	readCsv(argv._[0], parseCsv);
}

function streamCsv(url, cb) {
	if (/^https/.test(url)) {
		https.get(url, function(res) {
			parseCsv(res);
		});
	} else {
		http.get(url, function(res) {
			parseCsv(res);
		});
	}
}

function readCsv(path, cb) {
	var s = fs.createReadStream(argv._[0]);
	parseCsv(s);
}

function parseCsv(stream) {

	csv()
		.from.stream(stream, {
			delimiter: ',',
			columns: true
		})
		.to.array(function(data) {
			/* TODO: support a header row */
			async.forEach(data, function(row, next) {
					var newRow = {};

					async.forEach(Object.keys(row), function(k, cb) {

							var u = k.toLowerCase();
							newRow[u] = row[k];
							cb();
						},

						function(err, result) {
							if (err) {
								console.log(err);
							} else {
								handleRow(newRow, next);
							}
						});
				},
				function(err, result) {
					/* sort the tops */
					var v = Object.keys(topVenue).sort(function(a, b) {return -(topVenue[a] - topVenue[b])});
					v.slice(0,100).forEach(function(k) {
						console.log(k + ' => ' + topVenue[k]);
					});


					process.exit(0);
				});
		});
}
