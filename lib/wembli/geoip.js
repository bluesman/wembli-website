var wembliUtils = require('../wembli/utils');
var geoip = require('geoip');

(function() {
    var City = geoip.City;
    var city = new City('/home/wembli/website/data/GeoLiteCity.dat');

    module.exports = function(req,res,next) {
	var ipAddress = req.headers['x-forwarded-for'];
	//console.log(ipAddress);
	if ((/(\d+)\.(\d+)\.(\d+)\.(\d+)/.test(ipAddress)) && ipAddress != '127.0.0.1') {
	} else {
	    ipAddress = "184.106.146.14";
	}
	console.log('ipaddress:'+ipAddress);
	req.session.ipinfo = city.lookupSync(ipAddress);
	console.log(req.session.ipinfo);
	next();
    }

}());