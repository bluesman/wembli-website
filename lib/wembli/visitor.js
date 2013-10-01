var utils = require('./utils');
var ua = require('useragent');
var uuid = require('node-uuid'); //this is for making a guid
//ua(true); //sync with remote server to make sure we have the latest and greatest

module.exports = function(req, res, next) {

	if (req.param('redirectUrl')) {
		req.session.redirectUrl = req.param('redirectUrl');
	}

	//set up visitor
	if (typeof req.session.visitor === "undefined") {
		req.session.visitor = {
			context: 'visitor'
		};
	} else {
		req.session.visitor.context = 'visitor';
	}
	req.session.visitor.tracking = loadTracking(req, res);
	next();
};

/*
 * this function aggregates environment info for tracking purposes
 */

function loadTracking(req, res) {
	var d = {};
	d = userAgent(d, req, res);
	d.ipAddress = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'];
	d.cityCountryCode = req.headers['x-geoip-city-country-code'];
	d.cityCountryCode3 = req.headers['x-geoip-city-country-code3'];
	d.cityCountryName = req.headers['x-geoip-city-country-name'];
	d.region = req.headers['x-geoip-region'];
	d.city = req.headers['x-geoip-city'];
	d.postalCode = req.headers['x-geoip-postal-code'];
	d.cityContinentCode = req.headers['x-geoip-city-continent-code'];
	d.latitude = req.headers['x-geoip-latitude'];
	d.longitude = req.headers['x-geoip-longitude'];
	d.dmaCode = req.headers['x-geoip-dma-code'];
	d.areaCode = req.headers['x-geoip-area-code'];
	d.referer = req.headers['referer'];
	d.location = {
		"coordinates": [d.latitude, d.longitude]
	};

	/* check for a visitorId */
	if (typeof req.session.visitor.visitorId === "undefined") {
		if (typeof req.cookies['wembli.vid'] !== "undefined") {
			req.session.visitor.visitorId = req.cookies['wembli.vid'];
		} else {
			/* make a new visitorId and set it in a separate cookie that never expires */
			req.session.visitor.visitorId = uuid.v1();
			res.cookie('wembli.vid', req.session.visitor.visitorId, {
				expires: new Date(Date.now() + (10 * 365 * 24 * 60 * 60 * 1000)),
				path: '/'
			});
		}
	}
	d.visitorId = req.session.visitor.visitorId;

	/* if there is a visitId in the session use it...session will expire in 1 week and a new visitId should be created */
	if (typeof req.session.visitor.visitId === "undefined") {
		req.session.visitor.visitId = uuid.v1();
	}
	d.visitId = req.session.visitor.visitId;

	return d;
};

function userAgent(trackingData, req, res) {
	trackingData.userAgent = req.headers['user-agent'];

	try {
		var a = ua.parse(req.headers['user-agent']);
		trackingData.userAgentGroup = a.toAgent();
		trackingData.os = a.os.toString();
		trackingData.device = a.device.toString();
	} catch (err) {

	}

	return trackingData;
}
