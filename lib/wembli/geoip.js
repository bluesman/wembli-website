var wembliUtils = require('../wembli/utils');
var geoip = require('geoip');

(function() {
	var City = geoip.City;
	var city = new City('data/GeoLiteCity.dat');

	module.exports = function(req, res, next) {
		var ipAddress = req.headers['x-real-ip'];
		if ((/(\d+)\.(\d+)\.(\d+)\.(\d+)/.test(ipAddress)) && ipAddress != '127.0.0.1') {} else {
			ipAddress = "72.197.109.178";
		}
		req.session.ipinfo = city.lookupSync(ipAddress);
		next();
	}

}());
