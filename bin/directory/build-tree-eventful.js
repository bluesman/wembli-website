var fs = require('fs');
var xmlStream = require('xml-stream');
var redis = require('redis');
var async = require('async');
var elasticsearch= require('elasticsearch');
var es = new elasticsearch.Client({
		host: 'es01.wembli.com:9200'
});

/* maybe this is a param some day */
var dataSource = 'eventful';
var maxTopCount = 100;

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


function manageTopList(key, topGeo, obj, cb) {
	/* determine if we need to add this one to the top */
	var save = {
		min: obj.score,
		list:[]
	};
	if (topGeo !== null) {
		//TODO: sort
		save = JSON.parse(topGeo);
	}

	/* if we don't have a full list yet then just put this in there */
	if (save.list.length < maxTopCount) {
		async.detect(save.list,function(item, detectCb) {
			if (item.name && item.name == obj.name) {
				detectCb(true);
			} else {
				detectCb();
			}
		}, function(result){
			if (typeof result === "undefined") {
				save.list.push(obj);
				if (save.min > obj.score) {
					/* a new low score */
					save.min = obj.score;
				}
			}
			store(key,save);
			cb(null,true);
		});
	} else {
		/* this deserves to be in the top */
		if (obj.score > save.min) {
			async.detect(save.list,function(item, detectCb) {
				if (item.name && item.name == obj.name) {
					/* just update the score if its in the list already */
					item.score = obj.score;
					detectCb(true);
				} else {
					detectCb();
				}
			}, function(result){
				if (typeof result === "undefined") {
					/* add this to the list */
					save.list.push(obj);
				}

				/* sort the list by score and slice the last one */
				var sorted = save.list.sort(function(a, b) {
					return -(a.score - b.score);
				});
				save.list = sorted.slice(0, maxTopCount);
				save.min = save.list[save.list.length-1].score;
				store(key,save);
				cb(null,true);
			});
		} else {
			/* this item didn't make the cut so sorry */
			cb(null,true);
		}
	}
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
		xml.pause();

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
				var detailKey = url + '/' + slugs[lookup[type]];
				var detailVal = {dataSource: dataSource, type: type};

				if (type === 'events') {
					detailVal.id = e.id;
					detailVal.venueId = e.venue_id;
					detailVal.performIds = e.performers;
				}

				if (type === 'venues') {
					detailVal.id = v.id;
				}
				store(detailKey,detailVal);


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
						store(url, obj)
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
					var performerKey = '/' + pSlug;
					var performerVal = {
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
					performerVal.categories.push(c);
					store(performerKey, performerVal);

					/* performer by category */
					var obj = {
						"type": "performers",
						"breadcrumbs": []
					};

					obj.breadcrumbs.push([e.categories.category.name, '/' + slugs['category']]);
					var performerCategoryKey = '/' + slugs['category'];
					var performerCategoryVal = obj;
					store(performerCategoryKey,performerCategoryVal);

					/* performer by sub category */
					if (typeof e.subcategories !== "undefined" && e.subcategories !== '') {
						obj.breadcrumbs.push([e.subcategories.subcategory.short_name, '/' + slugs['category'] + '/' + slugs['subcategory']]);
						var performerSubcategoryKey = '/' + slugs['category'] + '/' + slugs['subcategory'];
						var performerSubcategoryVal = obj;
						store(performerSubcategoryKey, performerSubcategoryVal);
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

			async.series([

				/* tally the score for the venue and manage the top venues list */
				function(callback) {
					//tally the score for the venue
					// get data from redis and update accordingly
					client.get('directory:score:/venues/'+slugs['venue'], function(err, res) {
						var obj = {
							score:score,
							name:v.name,
							url: '/venues/'+slugs['venue']
						};

						['country', 'region', 'city'].forEach(function(geo) {
							obj[geo] = slugs[geo];
						});

						if (res !== null) {
							obj = JSON.parse(res);
							obj.score += score;
						}

						store('score:/venues/'+slugs['venue'],obj);

						/* do the geos in parallel */
						async.parallel([
							/* top venues by country */
							function(parallelCb) {
								var key = 'top:/venues/'+slugs["country"];
								client.get('directory:'+key, function(err, res) {
									manageTopList(key, res, obj, parallelCb);
								});
							},

							/* top venues by country/region */
							function(parallelCb) {
								var key = 'top:/venues/'+slugs["country"]+'/'+slugs['region'];
								client.get('directory:'+key, function(err, res) {
									manageTopList(key, res, obj, parallelCb);
								});
							},
							/* top venues by country/region/city */
							function(parallelCb) {
								var key = 'top:/venues/'+slugs["country"]+'/'+slugs['region']+'/'+slugs['city'];
								client.get('directory:'+key, function(err, res) {
									manageTopList(key, res, obj, parallelCb);
								});
							},
						], function(err, results) {
							callback(null, true);
						});
					});
				},

				/* tally the score for event and manage the top events list */
				function(callback) {
					//tally the score for the event
					// get data from redis and update accordingly
					client.get('directory:score:/events/'+slugs['event'], function(err, res) {
						var obj = {
							score:score,
							name:e.title,
							url: '/events/'+slugs['event']
						};

						['country', 'region', 'city'].forEach(function(geo) {
							obj[geo] = slugs[geo];
						});

						if (res !== null) {
							obj = JSON.parse(res);
							obj.score += score;
						}

						store('score:/events/'+slugs['event'],obj);

						/* do the geos in parallel */
						async.parallel([
							/* top venues by country */
							function(parallelCb) {
								var key = 'top:/events/'+slugs["country"];
								client.get('directory:'+key, function(err, res) {
									manageTopList(key, res, obj, parallelCb);
								});
							},

							/* top venues by country/region */
							function(parallelCb) {
								var key = 'top:/events/'+slugs["country"]+'/'+slugs['region'];
								client.get('directory:'+key, function(err, res) {
									manageTopList(key, res, obj, parallelCb);
								});
							},
							/* top venues by country/region/city */
							function(parallelCb) {
								var key = 'top:/events/'+slugs["country"]+'/'+slugs['region']+'/'+slugs['city'];
								client.get('directory:'+key, function(err, res) {
									manageTopList(key, res, obj, parallelCb);
								});
							},
						], function(err, results) {
							callback(null, true);
						});
					});
				},

				/* performers */
				function(callback) {
					if (typeof ps !== "undefined" && ps !== '') {
						ps.forEach(function(p) {
							pSlug = slugs.performer[p.id];

							client.get('directory:score:/'+pSlug, function(err, res) {
								var obj = {
									score:score,
									name:p.name,
									url:'/'+pSlug,
									categories:{}
								};

								if (res !== null) {
									obj = JSON.parse(res);
									obj.score += score;
								}

								if (slugs['category']) {
									obj["categories"]['category'] = obj["categories"]['category'] || {};
									obj["categories"]['category'][slugs['category']] = obj["categories"]['category'][slugs['category']] ? obj["categories"]['category'][slugs['category']] + 1 : 1;
								}

								if (slugs['subcategory']) {
									obj["categories"]['subcategory'] = obj["categories"]['subcategory'] || {};
									obj["categories"]['subcategory'][slugs['subcategory']] = obj["categories"]['subcategory'][slugs['subcategory']] ? obj["categories"]['subcategory'][slugs['subcategory']] + 1 : 1;
								}

								//give this a tmp: namespace?
								store('score:/'+pSlug, obj);

								/* get the top: for this category */
								async.parallel([
									/* top venues by country */
									function(parallelCb) {
										var key = 'top:/'+slugs["category"];
										client.get('directory:'+key, function(err, res) {
											manageTopList(key, res, obj, parallelCb);
										});
									},
									/* top performers by subcategory */
									function(parallelCb) {
										var key = 'top:/'+slugs['category']+'/'+slugs["subcategory"];
										client.get('directory:'+key, function(err, res) {
											manageTopList(key, res, obj, parallelCb);
										});
									},
								], function(err, results) {
									callback(null, true);
								});
							});
						});
					} else {
						callback(null,true);
					}
				},

				/* categories, subcategories and geo lists */
				function(callback) {
					/* make a list of categories for key 'category:/' */
					/* check for this key in redis */
					client.get('directory:category:/', function(err, res) {
						var list = [];
						var obj = {};
						if (res !== null) {
							list = JSON.parse(res);
						}
						/* now add this category */
						obj.name = e.categories.category.name;
						obj.url = '/' + slugs['category'];
						async.detect(list,function(item, detectCb) {
							if (item.name && item.name == obj.name) {
								detectCb(true);
							} else {
								detectCb();
							}
						}, function(result){
							if (typeof result === "undefined") {
								list.push(obj);
								store('category:/', list);
							}

							if (slugs['subcategory']) {
								client.get('directory:category:/'+slugs['category'], function(err, res) {
									var list = [];
									var obj = {};
									if (res !== null) {
										list = JSON.parse(res);
									}
									/* now add this category */
									obj.name = e.subcategories.subcategory.short_name;
									obj.url = '/'+slugs['category']+'/'+slugs['subcategory'];
									async.detect(list,function(item, detectCb) {
										if (item.name && item.name == obj.name) {
											detectCb(true);
										} else {
											detectCb();
										}
									}, function(result){
										/* store this obj in the list since it wasn't already in there */
										if (typeof result === "undefined") {
											list.push(obj);
											store('category:/'+slugs['category'], list);
										} else {
											/* already in the list */
										}
									});
								});
							}
						});

						/* geo lists */
						async.forEachSeries(['events', 'venues'], function(type, callback2) {
							var url = '/' + type;
							var geoKey = 'geo:' + url;
							var prevGeo = '/';
							async.forEachSeries(['country', 'region', 'city'], function(g, callback3) {
								/* make lists of countries in root, regions in /country, and cities in /country/region */
								/*
								 * 1st loop: geoKey = 'geo:/events'
								 * 2nd loop: 'geo:/events/united-states'
								 * 3rd loop: 'geo:/events/united-states/california'
								 */
								client.get('directory:'+geoKey, function(err, res) {
									var list = [];
									var obj = {};
									if (res !== null) {
										list = JSON.parse(res);
									}
									/* contains the geo name for the venue and the url
									 *
									 * 1st: [United States, '/events/united-states']
									 * 2nd: [California, '/events/united-states/california']
									 * 3rd: [San Diego, '/events/united-states/california/san-diego']
									 */

									/* detect of this v[g] is already in the array */
									obj.name = v[g];
									obj.url = url + '/' + slugs[g];
									async.detect(list,function(item, detectCb) {
										if (item.name && item.name == obj.name) {
											detectCb(true);
										} else {
											detectCb();
										}
									}, function(result){
										if (typeof result === "undefined") {
											list.push(obj);
											/* now store it */
											store(geoKey, list);
										}

										prevGeo = slugs[g];
										geoKey += '/' + prevGeo;
										url += '/' + prevGeo;

										callback3();

									});
								});
							}, function(err) {
								callback2();
							});
						}, function(err) {
							callback(null,true);
						});
					});
				}


			/* finished score tally for events, venues and performers */
			], function(err, results) {
				xml.resume();
				totalProcessed++;
			});
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
			/* sort everything */



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
