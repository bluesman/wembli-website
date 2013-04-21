var querystring = require('querystring');
var request = require('request');

module.exports = {
	geocode: function(address, callback) {
		_get({address:address}, callback);
	},
	reverse: function(args, callback) {
		_get({address:address}, callback);
	}
};

function _get(args, callback) {
	var params = querystring.stringify(args, sep = '&', eq = '=');
	var url = 'http://maps.googleapis.com/maps/api/geocode/json?sensor=false&' + params ;

	var options = {
		'url': url,
		json: true
	};

	console.log(options);

	request(options, function(err, res, body) {
		if (!err && res.statusCode == 200) {
			callback(null, body.results);
		} else {
			callback(err);
		}
	});
};
