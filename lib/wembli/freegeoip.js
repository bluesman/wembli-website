/* deprecated...for now */
var wembliUtils = require('./utils');

var requestOptions = {
	'host': 'freegeoip.net',
	'port': 80
};

var ipinfodb = {};
ipinfodb.getAddressByIp = function(ip, callback) {
	var args = {};
	args.path = '/json/' + ip;
	args = wembliUtils.merge(requestOptions, args);
	var params = wembliUtils.merge({}, args);
	wembliUtils.makeRequest(params, callback);
}

module.exports = {
	lookup: function(req, res, cb) {
		if ((typeof req.session.visitor.tracking == "undefined") || (typeof req.session.visitor.tracking.freegeoip === "undefined")) {
			var ipAddress = req.headers['cf-connecting-ip'] || req.headers['x-real-ip'];
			if ((/(\d+)\.(\d+)\.(\d+)\.(\d+)/.test(ipAddress)) && ipAddress != '127.0.0.1') {} else {
				ipAddress = "72.197.109.178";
			}

			ipinfodb.getAddressByIp(ipAddress, cb);
		} else {
			cb(null,{});
		}
	}
};
