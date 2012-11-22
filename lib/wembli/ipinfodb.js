/* deprecated...for now */
var wembliUtils = require('../wembli/utils');

(function() {
	var apiKey = '2e09afd55f51e1f56b6ae617dd56d4c97d5277aaa1762359fbc6463179c980ff';
	var requestOptions = {
		'host': 'api.ipinfodb.com',
		'port': 80
	};


	var ipinfodb = {};
	ipinfodb.getAddressByIp = function(args, callback) {
		var template = {
			path: '/v3/ip-city/',
			key: apiKey,
			format: "json",
			ip: null
		};
		args = wembliUtils.merge(requestOptions, args);
		var params = wembliUtils.merge(template, args);
		wembliUtils.makeRequest(params, callback);
	}

	module.exports = function(req, res, next) {

/*
		req.session.ipinfo = { statusCode: 'OK',
  statusMessage: '',
  ipAddress: '184.106.146.14',
  countryCode: 'US',
  countryName: 'UNITED STATES',
  regionName: 'TEXAS',
  cityName: 'SAN ANTONIO',
  zipCode: '78225',
  latitude: '29.4241',
  longitude: '-98.4936',
  timeZone: '-05:00',
  postal_code: '78225',
  city: 'SAN ANTONIO' };
  console.log('returning with hardcoded ipinfo');
  return next();
*/

		//if (typeof req.session.ipinfo == "undefined") {
		console.log(req.headers);
		var ipAddress = req.headers['x-real-ip'];
			if ((/(\d+)\.(\d+)\.(\d+)\.(\d+)/.test(ipAddress)) && ipAddress != '127.0.0.1') {} else {
			ipAddress = "72.197.109.178";
		}

		ipinfodb.getAddressByIp({
			ip: ipAddress
		}, function(err, ipinfo) {
			req.session.ipinfo = ipinfo;
			req.session.ipinfo.postal_code = req.session.ipinfo.zipCode;
			req.session.ipinfo.city = req.session.ipinfo.cityName;
			console.log(req.session.ipinfo);
			next();
		});
		//} else {
		//	    next();
		//}
	}

}());
