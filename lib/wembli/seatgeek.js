var querystring = require('querystring');
var request     = require('request');
var utils       = require('wembli/utils');

/* http://platform.seatgeek.com/ */
module.exports = {
	searchVenues: function(args, callback) {
		var template = {
			method: '/venues/',
			q:null,
			city:null,
			state:null,
			country:null,
			postal_code:null
		};
		var params = utils.merge(template, args);
		_get(params, callback);
	},

	/* pass method: <venue-name-parking> */
	getVenue: function(args, callback) {
		params = {method: '/venues/'+args.id};
		_get(params, callback);
	}
}

function _get(args, callback) {
	var proto  = 'http://';
	var method = args.method;
	delete args.method;
	var params = querystring.stringify(args, sep = '&', eq = '=');
	var uri    = '/2' + method + '?' + params;
	var host   = 'api.seatgeek.com';

	if ((typeof app !== "undefined") && (typeof app.settings.sgUrl !== "undefined")) {
		host = app.settings.sgUrl;
	}

	var options = {
		'url': proto+host+uri,
		json:true
	};

	console.log(options);

	request(options, function(err, res, body) {
		if (!err && res.statusCode == 200) {
			callback(null,body);
		} else {
			callback(err);
		}
	});
}
