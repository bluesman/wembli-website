var ua   = require('useragent');
var uuid = require('node-uuid'); //this is for making a guid
ua(true); //sync with remote server to make sure we have the latest and greatest

module.exports = function(req, res, next) {
	console.log('in visitor.js LOADING URL: '+req.url);

	if (req.param('redirectUrl')) {
		console.log('passed in a redirect url..');
		req.session.redirectUrl = req.param('redirectUrl');
	}

	//set up visitor
	if (typeof req.session.visitor === "undefined") {
		req.session.visitor = {context:'visitor'};
		req.session.visitor.tracking = {
				
		};
	} else {
		req.session.visitor.context = 'visitor';
	}

	next();
};

/*
 * this function aggregates environment info for tracking purposes
 */
function loadTracking() {
	
};

function addUserAgent(trackingData, req, res) {
    trackingData.userAgent = req.headers['user-agent'];

    try {
        var a = ua.parse(req.headers['user-agent']);
        trackingData.userAgentGroup = a.toAgent();
        trackingData.os = a.os.toString();
        trackingData.device = a.device.toString();
    } catch (err) {
        console.log('error parsing ua');
        console.log(err);
    }

    return trackingData;
}


