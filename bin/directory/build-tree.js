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
			var venueDetail = '/venue/' + slugs['venue'];
			store(venueDetail, row['VenueID']);
		}

		if (slugs['performer']) {
			var performerDetail = '/' + slugs['performer'];
			store(performerDetail, row['PerformerID']);
		}

		if (slugs['event']) {
			var eventDetail = '/event/' + slugs['event'];
			store(eventDetail, row);
		}

		/* tony says don't do performers by geo */
		(function() {
			['venues', 'events'].forEach(function(type) {
				var url = '/' + type;
				urls[type][url] = true;
				['country', 'state', 'city'].forEach(function(sub) {
					if (slugs[sub]) {
						url += '/' + slugs[sub];
						urls[type][url] = true;
					}
				})
			});
		})();

		(function() {
			var url = '';
			['pcat', 'ccat', 'gcat'].forEach(function(cat) {
				if (slugs[cat]) {
					if (slugs[cat] == '-') {
						return;
					}
					url += '/' + slugs[cat];
					urls['performers'][url] = true;
				}
			});
		})();

		/* score */
		var score = parseInt(row['numorders']) + parseInt(row['numticketssold']);

		/* lists of venues, performers, events by score, with meta data: country, state, city, pcat, ccat, gcat */
		topVenue[slugs['venue']] = topVenue[slugs['venue']] || {"score": 0};
		topVenue[slugs['venue']].score += score;
		['country','state','city'].forEach(function(geo) {
			topVenue[slugs['venue']][geo] = slugs[geo];
		});

		topEvent[slugs['event']] = topEvent[slugs['event']] || {"score": 0};
		topEvent[slugs['event']].score += score;
		['country','state','city'].forEach(function(geo) {
			topEvent[slugs['event']][geo] = slugs[geo];
		});


		/* performers */
		topPerformer[slugs['performer']] = topPerformer[slugs['performer']] || {"score": 0};
		topPerformer[slugs['performer']].score += score;
		['country','state','city','pcat','ccat','gcat'].forEach(function(el) {
			if (slugs[el]) {
				topPerformer[slugs['performer']][slugs[el]] = topPerformer[slugs['performer']][slugs[el]] ? topPerformer[slugs['performer']][slugs[el]] + 1 : 1;
			}
		});

		/* category lists */
		var catKey = 'category:';
		var prevCat = '';
		['pcat','ccat','gcat'].forEach(function(cat) {
			catKey += '/' + prevCat;
			category[catKey] = category[catKey] || {};
			category[catKey][slugs[cat]] = true;
			prevCat = cat;
		});

		/* geo lists */
		var geoKey = 'geo:';
		['events','venues'].forEach(function(type) {
			var prevGeo = type;
			['country','state','city'].forEach(function(g) {
				geoKey += '/' + prevGeo;
				geo[geoKey] = geo[geoKey] || {};
				geo[geoKey][slugs[g]] = true;
				prevGeo = g;
			});

		});

		next();
	});
};

function store(key, val) {
	console.log(key);
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

					/* sort the tops */
					var v = Object.keys(topVenue).sort(function(a, b) {
						return -(topVenue[a].score - topVenue[b].score)
					});
					v.slice(0, 100).forEach(function(k) {
						//console.log(k + ' => ');
						//console.log(topVenue[k]);
					});

					/* supplemental redis data
					 * top
					 * geo (list of countries, states, cities)
					 * category
					 */

					/* figure out top_events */
					//organizeByCountry('top:', '/events', topEvent);

					/* tony didn't say to organizer performers by country */
					//organizeByCountry('top_performers', '/', topPerformer)
					//organizeByCountry('top:', '/venues', topVenue);

					//organizeByCategory('top:', '/', topPerformer);

					function organizeByCategory(namespace, root, list) {

						var eAllSorted = Object.keys(list).sort(function(a, b) {
							return -(list[a].score - list[b].score)
						});

						/* find top events by pcat */
						var ePcat = {};
						Object.keys(country).forEach(function(c) {
							eAllSorted.forEach(function(el) {
								if (list[el].country == c) {
									if (!eCountry[c]) {
										eCountry[c] = {};
									}
									eCountry[c][el] = list[el];
								}
							});
							var k = namespace + root + '/' + c;

							/* top 100 events by country */
							var eCountrySorted = Object.keys(eCountry[c]).sort(function(a, b) {
								return -(eCountry[c][a].score - eCountry[c][a].score)
							});
							store(k, eCountrySorted.slice(0, 100));

							/* find top events by state */
							var eState = {};
							Object.keys(state).forEach(function(s) {

								eAllSorted.forEach(function(el) {
									if (list[el].state == s) {
										if (!eState[s]) {
											eState[s] = {};
										}
										eState[s][el] = list[el];
									}
								});

								if (eState[s]) {
									var k = key + '/' + c + '/' + s;
									/* top 100 events by state */
									var eStateSorted = Object.keys(eState[s]).sort(function(a, b) {
										return -(eState[s][a].score - eState[s][a].score)
									});
									store(k, eStateSorted.slice(0, 100));


									/* find top events by city */
									var eCity = {};
									Object.keys(city).forEach(function(ci) {
										eAllSorted.forEach(function(el) {
											if (list[el].city == ci) {
												if (!eCity[ci]) {
													eCity[ci] = {};
												}
												eCity[ci][el] = list[el];
											}
										});
										if (eCity[ci]) {

											var k = key + '/' + c + '/' + s + '/' + ci;
											/* top 100 events by city */
											var eCitySorted = Object.keys(eCity[ci]).sort(function(a, b) {
												return -(eCity[ci][a].score - eCity[ci][a].score)
											});
											store(k, eCitySorted.slice(0, 100));
										}
									});
								}
							});
						});
					}

					function organizeByCountry(namespace, root, list) {

						/* list sorted by score descending */
						var eAllSorted = Object.keys(list).sort(function(a, b) {
							return -(list[a].score - list[b].score)
						});

						/* find top events by country */
						var eCountry = {};

						Object.keys(country).forEach(function(c) {

							/* for each event */
							eAllSorted.forEach(function(el) {

								if (list[el].country == c) {

									if (!eCountry[c]) {
										eCountry[c] = {};
									}
									eCountry[c][el] = list[el];
								}

							});

							/* top_events:/events/united-states-of-america */
							var k = namespace + root + '/' + c;

							/* top 100 events by country */
							var eCountrySorted = Object.keys(eCountry[c]).sort(function(a, b) {
								return -(eCountry[c][a].score - eCountry[c][a].score)
							});

							store(k, eCountrySorted.slice(0, 100));

							/* find top events by state */
							var eState = {};
							/* loop through all states */
							Object.keys(state).forEach(function(s) {

								/* loop through all events */
								eAllSorted.forEach(function(el) {
									/* if the state for this event is this state */
									if (list[el].state == s) {

										if (!eState[s]) {
											eState[s] = {};
										}
										/* put this element into the states hash */
										eState[s][el] = list[el];
									}
								});

								if (eState[s]) {
									var k = namespace + root + '/' + c + '/' + s;
									/* top 100 events by state */
									var eStateSorted = Object.keys(eState[s]).sort(function(a, b) {
										return -(eState[s][a].score - eState[s][a].score)
									});
									store(k, eStateSorted.slice(0, 100));


									/* find top events by city */
									var eCity = {};
									Object.keys(city).forEach(function(ci) {
										eAllSorted.forEach(function(el) {
											if (list[el].city == ci) {
												if (!eCity[ci]) {
													eCity[ci] = {};
												}
												eCity[ci][el] = list[el];
											}
										});
										if (eCity[ci]) {

											var k = namespace + root + '/' + c + '/' + s + '/' + ci;
											/* top 100 events by city */
											var eCitySorted = Object.keys(eCity[ci]).sort(function(a, b) {
												return -(eCity[ci][a].score - eCity[ci][a].score)
											});
											store(k, eCitySorted.slice(0, 100));
										}
									});
								}
							});
						});
					}

					/* loop through and store the urls */
					Object.keys(urls).forEach(function(type) {
						Object.keys(urls[type]).forEach(function(url) {
							store(url,true);
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
							store(key, sorted);
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
							store(key, sorted);
						}
					});

					process.exit(0);
				});
		});
}
