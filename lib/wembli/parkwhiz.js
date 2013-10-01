var querystring = require('querystring');
var request = require('request');
var psUtils = require('wembli/utils');

module.exports = {
	search: function(args, callback) {
		var template = {
			method: '/search/',
			destination: null,
			lat: null,
			lng: null,
			start:null,
			end:null,
			sort:null,
			price:null,
			shuttle:null,
			eticket:null,
			perk:null,
			valet:null,
			indoor:null,
			handicap:null,
			restroom:null,
			security:null,
			tailgate:null,
			rv:null,
			unobstructed:null,
			attended:null
		};
		var params = psUtils.merge(template, args);
		_get(params, callback);
	},

	searchVenues: function(args, callback) {
		var template = {
			method: '/venue/search/',
			name:null,
			lat:null,
			lng:null
		};
		var params = psUtils.merge(template, args);
		_get(params, callback);
	},

	/* pass method: <venue-name-parking> */
	getVenue: function(args, callback) {
		var template = {
			method: null,
			start:null,
			page:null
		};
		var params = psUtils.merge(template, args);
		_get(params, callback);
	},
	/* pass method: <event-name-parking> */
	getEvent: function(args, callback) {
		var template = {
			method:null,
			start:null,
			end:null,
			sort:null,
			price:null,
			shuttle:null,
			eticket:null,
			perk:null,
			valet:null,
			indoor:null,
			handicap:null,
			restroom:null,
			security:null,
			tailgate:null,
			rv:null,
			unobstructed:null,
			attended:null
		};
		var params = psUtils.merge(template, args);
		_get(params, callback);
	},

	/* pass method: <location-name-parking> */
	getLocation: function(args, callback) {
		var template = {
			method: null,
			start:null,
			end:null,
			coupons:null
		};
		var params = psUtils.merge(template, args);
		_get(params, callback);
	},

	getAllLocations: function(args, callback) {
		var template = {
			method: '/parking/reservation/',
		};
		var params = psUtils.merge(template, args);
		_get(params, callback);
	}
}

function _get(args, callback) {
	var proto  = 'http://';
	var method = args.method;
	delete args.method;
	var params = querystring.stringify(args, sep = '&', eq = '=');
	var uri    = method + '?key=38411f79346adfa209b6545ca9259168&' + params;
	var host   = 'api.parkwhiz.com';

	if ((typeof app !== "undefined") && (typeof app.settings.pwUrl !== "undefined")) {
		host = app.settings.pwUrl;
	}

	var options = {
		'url': proto+host+uri,
		json:true
	};


	request(options, function(err, res, body) {
		if (!err && res.statusCode == 200) {
			callback(null,body);
		} else {
			callback(err);
		}
	});
}
