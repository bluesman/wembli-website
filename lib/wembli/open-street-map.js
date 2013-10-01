var querystring = require('querystring');
var request = require('request');
var utils = require('wembli/utils');
var async = require('async');


module.exports = {
	nominatim: {
		geocode: function(args, callback) {
			var template = {
				method: '/search/',
				q: null,
				street: null,
				city: null,
				county: null,
				state: null,
				country: null,
				postalcode: null,
				countrycodes: null,
				json_callback: null,
				viewbox: null,
				bounded: null,
				polygon: null,
				email: 'tom@wembli.com',
				exclude_place_ids: null,
				limit: null,
				dedupe: 1,
				debug: 0,
				polygon_geojson: null,
				polygon_kml: null,
				polygon_svg: null,
				polygon_text: null,
				addressdetails: 1,
			};
			var params = utils.merge(template, args);
			_get(params, callback);
		},
		reverse: function(args, callback) {
			var template = {
				method: '/reverse/',
				lat: null,
				lon: null,
				zoom: null,
				osm_type: null,
				osm_id: null,
				json_callback: null,
				email: 'tom@wembli.com',
				addressdetails: 1
			};
			var params = utils.merge(template, args);
			_get(params, callback);
		}
	}
};

function _get(args, callback) {
	var proto = args.proto || 'http://';
	var method = args.method;
	/* host: default here overridden by app.settings overridden by args */
	var host = 'nominatim.openstreetmap.org';
	if ((typeof app !== "undefined") && (typeof app.settings.pwUrl !== "undefined")) {
		host = app.settings.pwUrl;
	}
	host = args.host ? args.host : host;

	delete args.method;
	delete args.proto;
	delete args.host;

	/* delete args that are null */
	getArgs = {};
	async.forEach(Object.keys(args), function(key, callback) {
		if (args[key] !== null) {
			getArgs[key] = args[key];
		}
		callback();
	},

	function(err) {
		var params = querystring.stringify(getArgs, sep = '&', eq = '=');
		var uri = method + '?format=json&' + params;

		var options = {
			'url': proto + host + uri,
			json: true
		};


		request(options, function(err, res, body) {
			if (!err && res.statusCode == 200) {
				callback(null, body);
			} else {
				callback(err);
			}
		});

	})


}
