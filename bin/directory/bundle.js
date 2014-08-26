var fs = require('fs');
var xmlStream = require('xml-stream');
var redis = require('redis');
var async = require('async');
var gg = require('../../lib/wembli/google-geocode');
var ticketNetwork = require('../../lib/wembli/ticketnetwork');
var pw = require('../../lib/wembli/parkwhiz');
var yipit = require('../../lib/wembli/yipit');

var elasticsearch = require('elasticsearch');
var es = new elasticsearch.Client({
		host: 'es01.wembli.com:9200',
		log:"trace"
});

/* maybe this is a param some day */
var dataSource = 'eventful';
var maxTopCount = 100;

var argv = require('optimist')
	.usage('\nCreate a psuedo-random bundle of tickets restaurant & parking.\n\nUsage: $0 <zipcode>\n\n')
	.
default ('p', 6379)
	.describe('p', 'redis port')
	.alias('p', 'port')
	.
default ('h', 'redis01.wembli.com')
	.describe('h', 'redis host')
	.alias('h', 'host')
	.argv;

var client = redis.createClient(argv.p, argv.h, {});

client.on("error", function(err) {
	console.log("REDIS Error " + err);
});
console.log('process zip: ' + argv._[0]);

var error = function(e) {
	console.log(e);
	process.exit(e);
}

/* events in san diego selling the most tickets */
es.search({
  index: 'ticket_network',
  type:'events',
  size:3,
  body: {
  	"sort":[{"NumTicketsSold":{"order":"desc"}}],
  	"query": {
  		"filtered": {
  			"query": {
					"match": {
						"Zip":argv._[0]
					},
				},
  			"filter": {
  				"range": {
  					"DateTime": {"gte":"2014-08-20T00:00:00"}
  				}
  			}
  		}
  	},
  }
}).then(function (resp) {
	/* get lat/lon for this venue address */
	var address = resp.hits.hits[0]._source.VenueStreetAddress + ', ' + resp.hits.hits[0]._source.City + ', ' + resp.hits.hits[0]._source.State + ' ' + resp.hits.hits[0]._source.Zip;
	//console.log(address);

	console.log(resp.hits.hits[0]._source);

	gg.geocode(address, function(err, geocode) {
		//console.log('fetch geocode');
		//console.log(geocode[0].geometry);

		/* get the parking nearest to the venue */
		pw.search({
			lat: geocode[0].geometry.location.lat,
			lng: geocode[0].geometry.location.lng,
		}, function(err, results) {
			if (err) {
				return me(err);
			}
			//console.log(results);
			results.parking_listings.forEach(function(d) {
				//console.log(d);
			});

			console.log(results.parking_listings[0]);

		});

		/* get a restaurant deal near the venue */
		yipit.deals({
			lat: geocode[0].geometry.location.lat,
			lon: geocode[0].geometry.location.lng,
			radius: 20,
			tag:'restaurants'
		}, function(err, results) {
			if (err) {
				console.log(err);
			}
			//console.log(results);
			results.response.deals.forEach(function(d) {
				//console.log(d);
			});

			console.log(results.response.deals[0]);

		});




	});


}, function (error) {
  console.trace(error.message);
	process.exit(0);
});



/*
var options = {};
options.host = args.host;
delete args['host'];
options.port = args.port;
delete args['port'];
options.path = args.path;
delete args['path'];

var url = querystring.stringify(args, sep='&', eq='=');
var req = http.request(options, function(res) {
	res.setEncoding('utf8');
	var str = '';
	res.on('data', function(d) {
		str = str + d;
	});

	res.on('end', function() {
		fetchEvents(null, JSON.parse(str));
	});

});

req.end();

req.on('error', function(e) {
	error(e);
});
*/
