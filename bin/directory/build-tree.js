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

var urls = {
	'venues': {},
	'events': {},
	'performers': {}
};
var topVenue = {};
var topEvent = {};
var topPerformer = {};
var geo = {};
var category = {};

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

	/* HACK: replace THEATRE with THEATER */
	if (row["pcat"] === "THEATRE") {
		row["pcat"] = "THEATER";
	}

	/* if row ticketsyn == 'N' then next */
	if (row['ticketsyn'] === 'N') {
		next();
	}

	var slugs = {};

	/* TODO: event name isn't unique */
	var keys = ['event', 'performer', 'venue', 'pcat', 'ccat', 'gcat', 'country', 'state', 'city'];
	async.forEachSeries(keys, function(k, cb) {
		slugs[k] = makeSlug(row[k]);
		cb();
	}, function(err) {
		/* make urls */
		row.slugs = slugs;
		row.type = 'events';
		row.id = row.eventid;
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
		/* tony says don't do performers by geo */
		(function() {
			var lookup = {
				'venues': 'venue',
				'events': 'event'
			};
			var lookupId = {
				'venues': 'venueid',
				'events': 'eventid'
			};
			['venues', 'events'].forEach(function(type) {
				var url = '/' + type;
				var saveUrl = [];
				var obj = {
					type: type,
					id: row[lookupId[type]]
				};


				urls[type][url] = {type:type};
				urls[type][url + '/' + slugs[lookup[type]]] = type === 'events' ? row : obj;
				var geos = ['country', 'state', 'city'];
				geos.forEach(function(sub) {
					if (slugs[sub]) {
						url += '/' + slugs[sub];
						saveUrl.push(url);

						var obj = {
							"type": type,
							"breadcrumbs": []
						};

						for (var i = 0; i < geos.length; i++) {
							var g = geos[i];
							obj.breadcrumbs.push(
								[row[g], saveUrl[i]]
							);

							if (g == sub) {
								break;
							}
						};
						urls[type][url] = obj;
					}
				})
			});
		})();

		/* make all performer urls - which include performer detail and performers by category */
		(function() {
			var url = '';
			var saveUrl = [];

			urls['performers']['/' + slugs['performer']] = {type:"performers",id:row.performerid};
			var cats = ['pcat', 'ccat', 'gcat']

			cats.forEach(function(cat) {
				if (slugs[cat]) {
					if (slugs[cat] == '-') {
						return;
					}
					url += '/' + slugs[cat];
					saveUrl.push(url);

					var obj = {
						"type":"performers",
						"breadcrumbs": []
					};


					for (var i = 0; i < cats.length; i++) {
						var c = cats[i];
						obj.breadcrumbs.push(
							[row[c], saveUrl[i]]
						);
						if (c == cat) {
							break;
						}
					};
					urls['performers'][url] = obj;
				}
			});
		})();

		/* score */
		var score = parseInt(row['numorders']) + parseInt(row['numticketssold']);

		/* lists of venues, performers, events by score, with meta data: country, state, city, pcat, ccat, gcat */
		topVenue[slugs['venue']] = topVenue[slugs['venue']] || {
			"score": 0,
			"name":row["venue"]
		};

		topVenue[slugs['venue']].score += score;
		['country', 'state', 'city'].forEach(function(geo) {
			topVenue[slugs['venue']][geo] = slugs[geo];
		});

		topEvent[slugs['event']] = topEvent[slugs['event']] || {
			"score": 0,
			"name": row['event']
		};

		topEvent[slugs['event']].score += score;
		['country', 'state', 'city'].forEach(function(geo) {
			topEvent[slugs['event']][geo] = slugs[geo];
		});

		/* performers */
		topPerformer[slugs['performer']] = topPerformer[slugs['performer']] || {
			"score": 0,
			"name": row['performer']
		};
		topPerformer[slugs['performer']].score += score;
		['pcat', 'ccat', 'gcat'].forEach(function(el) {
			if (slugs[el]) {
				topPerformer[slugs['performer']][el] = topPerformer[slugs['performer']][el] || {};

				topPerformer[slugs['performer']][el][slugs[el]] = topPerformer[slugs['performer']][el][slugs[el]] ? topPerformer[slugs['performer']][el][slugs[el]] + 1 : 1;
			}
		});

		/* category lists */
		var url = '';
		var catKey = 'category:/' + url;
		var prevCat = '/';
		['pcat', 'ccat', 'gcat'].forEach(function(cat) {
			if (!slugs[cat]) {
				return;
			}
			category[catKey] = category[catKey] || {};
			category[catKey][slugs[cat]] = [row[cat], url + '/' + slugs[cat]];

			prevCat = slugs[cat];
			url += '/' + prevCat;
			if (!/\/$/.test(catKey)) {
			catKey += '/' + prevCat;


			} else {
			catKey += prevCat;

			}

		});

		/* geo lists */
		['events', 'venues'].forEach(function(type) {
			var url = '/' + type;
			var geoKey = 'geo:' + url;
			var prevGeo = '/';
			['country', 'state', 'city'].forEach(function(g) {
				geo[geoKey] = geo[geoKey] || {};

				geo[geoKey][slugs[g]] = [row[g], url + '/' + slugs[g]];

				prevGeo = slugs[g];
				geoKey += '/' + prevGeo;
				url += '/' + prevGeo;

			});
		});

		next();
	});
};

function store(key, val) {
	var k = 'directory:' + key;
	console.log(k);
	var str = JSON.stringify(val);
	client.set(k, str, redis.print);
	//client.get(key, redis.print);

}

function makeSlug(str) {
	/* lowercase, sub spaces for dash, no more than 1 dash in a row,  */
	var slug = str.toLowerCase().replace(/\W/g, ' ');
	slug = slug.replace(/\s\s*/g, '-');
	/* no - at beginning or end */
	slug = slug.replace(/^-/, '');
	slug = slug.replace(/-$/, '');
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
					/* lists of keys are here:
					 * urls
					 * geo
					 * category
					 * topVenue
					 * topEvent
					 * topPerformer
					 */

					/* supplemental redis data
					 * top
					 * geo (list of countries, states, cities)
					 * category
					 */

					/* figure out top_events */
					organizeByCountry('top:', '/events', topEvent);
					organizeByCountry('top:', '/venues', topVenue);

					/* tony didn't say to organizer performers by country */
					//organizeByCountry('top:', '/', topPerformer);

					organizeByCategory('top:', '', topPerformer);

					function organizeByCategory(namespace, root, list) {
						var topCat = {};

						/* each performer */
						Object.keys(list).forEach(function(slug) {
							var el = list[slug];
							var key = namespace + root;
							['pcat', 'ccat', 'gcat'].forEach(function(c) {
								if (el[c]) {
									/* this performer may have many categories */
									Object.keys(el[c]).forEach(function(cat) {
										key += '/' + cat;
										topCat[key] = topCat[key] || {};
										if (slug) {
											topCat[key][slug] = list[slug];
										}
									});
								}
							});
						});

						/* now topgeo should have a list of events by country */
						//console.log(topCat);
						/* sort each list and take the top 100 only */
						Object.keys(topCat).forEach(function(url) {
							var sorted = Object.keys(topCat[url]).sort(function(a, b) {
								return -(topCat[url][a].score - topCat[url][b].score)
							});

							var save = [];
							var top;
							sorted.slice(0,100).forEach(function(top) {
								save.push([topCat[url][top].name,'/'+top]);
							});
							store(url, save);
						});
					}

					function organizeByCountry(namespace, root, list) {
						var topGeo = {};
						/* for each event */
						/* TODO: handle multiple events with the same name */

						/* each country, each event */
						Object.keys(list).forEach(function(slug) {
							var el = list[slug];
							var key = namespace + root;
							['country', 'state', 'city'].forEach(function(g) {
								if (el[g]) {
									key += '/' + el[g];
									topGeo[key] = topGeo[key] || {};
									topGeo[key][slug] = el;
								}
							});
						});

						/* now topgeo should have a list of events by country */

						/* sort each list and take the top 100 only */
						Object.keys(topGeo).forEach(function(url) {
							var sorted = Object.keys(topGeo[url]).sort(function(a, b) {
								return -(topGeo[url][a].score - topGeo[url][b].score)
							});
							var save = [];
							sorted.slice(0,100).forEach(function(top) {
								save.push([topGeo[url][top].name, root + '/' + top]);
							});
							store(url, save);
						});
					}

					//console.log(urls);
					/* loop through and store the urls */
					Object.keys(urls).forEach(function(type) {
						Object.keys(urls[type]).forEach(function(url) {
							store(url, urls[type][url]);
						});
					});

					/* loop through and store the geo */
					Object.keys(geo).forEach(function(key) {
						if (geo[key]) {
							var sorted = Object.keys(geo[key]).sort(function(a, b) {
								if (a < b) return -1;
								if (a > b) return 1;
								return 0;
							});

							var list = [];
							sorted.forEach(function(g) {
								list.push(geo[key][g]);
							});
							store(key, list);
						}
					});

					/* loop through and store the category */
					Object.keys(category).forEach(function(key) {
						if (category[key]) {
							var sorted = Object.keys(category[key]).sort(function(a, b) {
								if (a < b) return -1;
								if (a > b) return 1;
								return 0;
							});

							var list = [];
							sorted.forEach(function(k) {
								list.push(category[key][k]);
							});
							store(key, list);
						}
					});

					process.exit(0);
				});
		});
}
