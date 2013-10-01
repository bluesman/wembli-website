var querystring = require('querystring');
var request = require('request');
var psUtils = require('wembli/utils');

module.exports = {
	deals: function(args, callback) {
		var template = {
			method: '/deals/',
			division: null,
			lat: null,
			lon: null,
			radius: null,
			source:null,
			phone:null,
			tag:null,
			paid:null,
			limit:100
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
	var uri    = method + '?key=qcs4tHU32QK23zLj&' + params;
	var host   = 'api.yipit.com';
	var version = '/v1';

	if ((typeof app !== "undefined") && (typeof app.settings.yipitUrl !== "undefined")) {
		host = app.settings.yipitUrl;
	}

	var options = {
		'url': proto+host+version+uri,
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
