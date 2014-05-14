var fs = require('fs');
var xmlStream = require('xml-stream');
var redis = require('redis');
var async = require('async');
var elasticsearch= require('elasticsearch');
var es = new elasticsearch.Client({
		host: '166.78.116.141:9200'
});

/* maybe this is a param some day */
var dataSource = 'eventful';


var argv = require('optimist')
	.usage('\nImport a full eventful xml feed file.\n\nUsage: $0 <file>\n\n')
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

client.on("error", function(err) {
	console.log("REDIS Error " + err);
});
console.log('process file: ' + argv._[0]);

function store(key, val) {
	var k = 'directory:' + key;
	var str = JSON.stringify(val);
	client.set(k, str);

	//client.get(key, redis.print);

}

function makeSlug(str) {
	/* lowercase, sub spaces for dash, no more than 1 dash in a row,  */
	var slug = str.toLowerCase();
	slug = slug.replace(/\&amp\;/g, 'and');
	slug = slug.replace(/\W/g, ' ');
	slug = slug.replace(/\s\s*/g, '-');
	/* no - at beginning or end */
	slug = slug.replace(/^-/, '');
	slug = slug.replace(/-$/, '');
	return slug;
}

/* get performer from ES by ID */
function getPerformer(p_id, cb) {
	es.get({index:'eventful', type:'performers', id: p_id}, function(err, res) {
		if (err) {
			return cb(err);
		}
		return cb(null, res);
	});
}

function getVenue(venue_id, cb) {

	es.get({index:'eventful', type:'venues', id:venue_id}, function(err, res) {
		if (err) {
			return cb(err);
		}
		return cb(null, res);
	});
}

client.on('ready', function() {
	var stream = fs.createReadStream(argv._[0]);
	var xml = new xmlStream(stream);

	/*
	 *
	 * * * EVENTS * * *
	 *
	 *
	  { id: 'E0-001-060179278-3',
	  url: 'http://eventful.com/louisville_ky/events/2014-pga-championship-thursday-competition-/E0-001-060179278-3?utm_source=apis&utm_medium=apim&utm_campaign=apic',
	  title: '2014 PGA Championship Thursday Competition',
	  description: '',
	  start_time: '2014-08-07 08:00:00',
	  stop_time: '',
	  venue_id: 'V0-001-000810991-7',
	  all_day: '0',
	  recur_string: '',
	  created: '2013-08-15 13:03:44',
	  owner: 'evdb',
	  privacy: '1',
	  free: '',
	  price: '',
	  modified: '2013-08-15 13:03:44',
	  popularity: '0069',
	  performers: '',
	  tickets:
	  { link:
	  { url: 'http://www.gigaticket.com/ResultsTicket.aspx?evtid=2152444&ppcsrc=eventful',
	        description: '',
	        provider: 'gigaticket.com',
	        time: '2013-08-20 06:18:48' } },
	  image: '',
	  categories: { category: { id: 'sports', name: 'Sports' } },
	  subcategories:
	  { subcategory:
	  { id: 'sports_golf',
	        parent: 'sports',
	        name: 'Sports: Golf',
	        short_name: 'Golf' } } }
	*/

	var urls = {
		'venues': {},
		'events': {},
		'performers': {}
	};

	var lookup = {
		'venues': 'venue',
		'events': 'event'
	};

	var topVenue = {};
	var topEvent = {};
	var topPerformer = {};
	var geo = {};
	var category = {};

	var totalRead = 0;
	var totalProcessed = 0;

	xml.on('endElement: result > events > event', function(e) {
		totalRead++;
		console.log(e.id);
		/* hold functions that fetch related data (venue & performer data) */
		var getRelated = [];

		/* if we have venue ids, add a funtion to get venue data by id */
		if (typeof e.venue_id != "undefined") {
			getRelated.push(function(parallelCb) {

				getVenue(e.venue_id, function(err, venue) {
					if (err) {
						parallelCb(err);
					} else {
						parallelCb(null,venue)
					}
				});
			});
		}

		/* if we have performer ids, add a function to get performer data by id */
		if (typeof e.performers != "undefined" && e.performers != '') {
			if (typeof e.performers[0] == "undefined") {
				e.performers = [e.performers];
			}
			/* function to get a list of performers */
			getRelated.push(function(parallelCb) {

				var performers = [];

				async.forEach(e.performers, function(p, eachCb) {

					var getPerformerCb = function(err, p) {
						if (!err) {
							performers.push(p);
						}
						eachCb();
					}

					getPerformer(p.performer.id, getPerformerCb)

				/* all performers are fetched */
				}, function(err) {
					if (err) {
						return parallelCb(err)
					} else {
						parallelCb(null, performers);
					}
				});
			});

		}

		/* get venue and performers for this event */
		async.parallel(getRelated, function(err, results) {
			/* ary will have 2 elements:
				 0: object venue for this event
				 1: array of performers for this event
			*/
			if (typeof results[0] !== "undefined") {
				var v = results[0]._source;
			}
			if (typeof results[1] !== "undefined") {
				var ps = [];
				results[1].forEach(function(p) {
					ps.push(p._source);
				});
			}

			if (typeof v === "undefined") {
				/* skip it if it has not venue for now  */
				return;
			}

			/* now build the redis data */
			var slugs = {};
			slugs['event']    = makeSlug(e.title);
			slugs['venue']    = makeSlug(v.name);
			slugs['country']  = makeSlug(v.country);
			slugs['region']   = makeSlug(v.region);
			slugs['city']     = makeSlug(v.city);
			slugs['category'] = makeSlug(e.categories.category.name);
			if (typeof e.subcategories !== undefined && e.subcategories !== '') {
				slugs['subcategory']    = makeSlug(e.subcategories.subcategory.short_name);
			}
			slugs['performer'] = {};

			/* event organization: */
			/* each geo gets a list of top events */
			/* each performer gets a list of events */
			/* each venue gets a list of events */
			/* each category gets a list of events */
			/* each tag gets a list of events */

			/* venue organization: */
			/* each geo gets a list of top venues */
			/* each tag gets a list of top venues */

			/* performer organization: */
			/* each category gets a list of top performers */
			/* each tag gets a list of top venues */

			/* create a category tree - since eventful does not provide that */
			/* create a geo tree - sence eventful does not provide that */

			/* venue and events are similar */

			['venues', 'events'].forEach(function(type) {

				/* dont do venues if there's no venue data */
				if (type == "venues" && (typeof v == "undefined" || v == '')) {
					return;
				}

				var url = '/' + type;

				/* detail url - eg: /venues/venue-slug */
				urls[type][ url + '/' + slugs[lookup[type]] ] = {dataSource: dataSource, type: type};
				if (type === 'events') {
					urls[type][ url + '/' + slugs[lookup[type]] ].id = e.id;
					urls[type][ url + '/' + slugs[lookup[type]] ].venueId = e.venue_id;
					urls[type][ url + '/' + slugs[lookup[type]] ].performerIds = e.performers;
				}

				if (type === 'venues') {
					urls[type][ url + '/' + slugs[lookup[type]] ].id = v.id;
				}

				/* urls for the geos */
				var saveUrl = [];
				var geos = ['country', 'region', 'city'];
				geos.forEach(function(sub) {
					if (slugs[sub]) {
						/* eg: /united-states/california */
						url += '/' + slugs[sub];
						saveUrl.push(url);

						var obj = {
							"type": type,
							"breadcrumbs": []
						};

						for (var i = 0; i < geos.length; i++) {
							var g = geos[i];
							obj.breadcrumbs.push(
								/* eg: ['United States', '/united-states'], ['California', '/united-states/california'] */
								[v[g], saveUrl[i]]
							);

							if (g == sub) {
								break;
							}
						};
						/* eg: urls['venues']['/united-states/california'] = {type: venues, breadcrumbs: [['United States', '/united-states'], ['California', '/united-states/california']]} */
						urls[type][url] = obj;
					}
				});
			});

			/* make all performer urls - which include performer detail and performers by category */
			var performersDemandScore = 0;
			if (typeof ps !== "undefined" && ps !== '') {
				/* foreach performer involved in this event */
				ps.forEach(function(p) {

					pSlug = makeSlug(p.name);
					slugs.performer[p.id] = pSlug;

					/* performer detail - eg: /dave-matthews-band */
					urls['performers']['/' + pSlug] = {
						dataSource: dataSource,
						type:'performers',
						id: p.id,
						categories: [],
					};

					var c = {};
					c.category = e.categories.category;
					if (e.subcategories) {
						c.subcategory = e.subcategories.subcategory;
					}
					urls['performers']['/' + pSlug].categories.push(c);

					/* performer by category */
					var obj = {
						"type": "performers",
						"breadcrumbs": []
					};

					obj.breadcrumbs.push([e.categories.category.name, '/' + slugs['category']]);
					urls['performers']['/' + slugs['category']] = obj;

					/* performer by sub category */
					if (typeof e.subcategories !== "undefined" && e.subcategories !== '') {
						obj.breadcrumbs.push([e.subcategories.subcategory.short_name, '/' + slugs['category'] + '/' + slugs['subcategory']]);
						urls['performers']['/' + slugs['category'] + '/' + slugs['subcategory']] = obj;
					}

					/* performer demand score */
					performersDemandScore += parseInt(p.popularity);

				});
			}

			/* score */
			var score = 0;
			if (typeof e.popularity !== "undefined") {
				score += parseInt(e.popularity);
			}
			if (typeof v.popularity !== "undefined") {
				score += parseInt(v.popularity);
			}
			if (performersDemandScore > 0 ) {
				score += performersDemandScore;
			}

			/* lists of venues, performers, events by score, with meta data: country, state, city, pcat, ccat, gcat */
			topVenue[slugs['venue']] = topVenue[slugs['venue']] || {
				"score": 0,
				"name": v.name
			};

			topVenue[slugs['venue']].score += score;
			['country', 'region', 'city'].forEach(function(geo) {
				topVenue[slugs['venue']][geo] = slugs[geo];
			});

			topEvent[slugs['event']] = topEvent[slugs['event']] || {
				"score": 0,
				"name": e.title
			};

			topEvent[slugs['event']].score += score;
			['country', 'region', 'city'].forEach(function(geo) {
				topEvent[slugs['event']][geo] = slugs[geo];
			});

			/* performers */
			if (typeof ps !== "undefined" && ps !== '') {
				ps.forEach(function(p) {
					pSlug = slugs.performer[p.id];
					topPerformer[pSlug] = topPerformer[pSlug] || {
						"score": 0,
						"name": p.name
					};
					topPerformer[pSlug].score += score;

					if (slugs['category']) {
						topPerformer[pSlug]['category'] = topPerformer[pSlug]['category'] || {};
						topPerformer[pSlug]['category'][slugs['category']] = topPerformer[pSlug]['category'][slugs['category']] ? topPerformer[pSlug]['category'][slugs['category']] + 1 : 1;
					}

					if (slugs['subcategory']) {
						topPerformer[pSlug]['subcategory'] = topPerformer[pSlug]['subcategory'] || {};
						topPerformer[pSlug]['subcategory'][slugs['subcategory']] = topPerformer[pSlug]['subcategory'][slugs['subcategory']] ? topPerformer[pSlug]['subcategory'][slugs['subcategory']] + 1 : 1;
					}
				});
			}

			/* category lists */
			var catKey = 'category:/';

			/* add categories to the root */
			if (slugs['category']) {
				category[catKey] = category[catKey] || {};
				category[catKey][slugs['category']] = [e.categories.category.name, '/' + slugs['category']];
			}

			/* add sub categories under categories */
			if (slugs['subcategory']) {
				catKey += slugs['category'];
				category[catKey] = category[catKey] || {};
				category[catKey][slugs['subcategory']] = [e.subcategories.subcategory.short_name, '/' + slugs['category'] + '/' + slugs['subcategory']];
			}

			/* geo lists */
			['events', 'venues'].forEach(function(type) {
				var url = '/' + type;
				var geoKey = 'geo:' + url;
				var prevGeo = '/';
				['country', 'region', 'city'].forEach(function(g) {
					geo[geoKey] = geo[geoKey] || {};

					geo[geoKey][slugs[g]] = [v[g], url + '/' + slugs[g]];

					prevGeo = slugs[g];
					geoKey += '/' + prevGeo;
					url += '/' + prevGeo;

				});
			});
			totalProcessed++;
		});
	});

	/*
	 *
	 * * * VENUES * * *
	 *
	 *
	  { id: 'V0-001-007298294-0',
	  url: 'http://eventful.com/baltimore_md/venues/boumi-temple-and-shrine-/V0-001-007298294-0?utm_source=apis&utm_medium=apim&utm_campaign=apic',
	  name: 'Boumi Temple and Shrine',
	  description: '',
	  venue_type: 'address',
	  venue_display: '1',
	  address: '5050 King Ave',
	  city: 'Baltimore',
	  tz_olson_path: '',
	  region: 'Maryland',
	  region_abbr: 'MD',
	  postal_code: '',
	  country: 'United States',
	  country_abbr2: 'US',
	  country_abbr: 'USA',
	  latitude: '39.2903',
	  longitude: '-76.6125',
	  geocode_type: 'City Based GeoCodes',
	  created: '2013-09-13 12:53:07',
	  modified: '2014-04-15 23:18:22',
	  owner: 'evdb',
	  withdrawn: '',
	  withdrawn_note: '',
	  popularity: '0',
	  image: '' }
	*/

	/*
	 *
	 * * * PERFORMERS * * *
	 *
	 *
	  { id: 'P0-001-014193493-7',
	  url: 'http://eventful.com/performers/the-routine-/P0-001-014193493-7',
	  name: 'The Routine',
	  short_bio: 'The Routine is an American Rock and Roll band formed in the spring of 2013. Front man Bryan Barbarin is backed up by an all star band whose performance glides across genres from Classic Rock, Blues, Soul, and World Beat, all seamlessly and with ease. In their own words “Its Rock and Roll to rattle your soul”.',
	  long_bio: '',
	  created: '2013-10-10 09:39:05',
	  modified: '2013-10-10 09:39:05',
	  creator: 'theroutineband',
	  demand_member_count: '0',
	  event_count: '5',
	  withdrawn: '0',
	  withdrawn_note: '',
	  popularity: '0',
	  image:
	  { url: 'http://s2.evcdn.com/images/block/I0-001/014/834/569-1.jpeg_/the-routine-69.jpeg',
	     width: '128',
	     height: '128',
	     block:
	     { url: 'http://s2.evcdn.com/images/block/I0-001/014/834/569-1.jpeg_/the-routine-69.jpeg',
	        width: '128',
	        height: '128' },
	     large:
	     { url: 'http://s2.evcdn.com/images/large/I0-001/014/834/569-1.jpeg_/the-routine-69.jpeg',
	        width: '480',
	        height: '480' } } }
	*/

	xml.on('error', function(message) {
	    console.log(message);
	});
	xml.on('endElement: result', function(e) {

		console.log('read:'+totalRead);

		var postProcess = function() {
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

			/* tony didn't say to organize performers by country */
			//organizeByCountry('top:', '/', topPerformer);

			organizeByCategory('top:', '', topPerformer);

			function organizeByCategory(namespace, root, list) {
				var topCat = {};
				/* each performer */
				Object.keys(list).forEach(function(slug) {
					var el = list[slug];
					var key = namespace + root;

					['category','subcategory'].forEach(function(c) {
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

				/* now topcat should have a list of events by category */
				/* sort each list and take the top 100 only */
				Object.keys(topCat).forEach(function(url) {
					var sorted = Object.keys(topCat[url]).sort(function(a, b) {
						return -(topCat[url][a].score - topCat[url][b].score)
					});

					var save = [];
					var top;
					sorted.slice(0, 100).forEach(function(top) {
						save.push([topCat[url][top].name, '/' + top]);
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
					['country', 'region', 'city'].forEach(function(g) {
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
					sorted.slice(0, 100).forEach(function(top) {
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

			/*
			console.log(topPerformer);
			console.log(topVenue);
			console.log(topEvent);
			console.log(geo);
			console.log(category);
			console.log(urls);
			*/

			client.end();
			process.exit();
		};

		var checkCompleted = function() {
			console.log('processed: '+totalProcessed);
			var timeoutId = setTimeout(function() {
				if (totalRead == totalProcessed) {
					postProcess();
				} else {
					checkCompleted();
				}
			}, 1000);
		};

		checkCompleted();

	});
});
