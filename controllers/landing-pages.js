var eventRpc = require('../rpc/event').event;
var wembliUtils = require('../lib/wembli/utils');
var async = require('async');

module.exports = function(app) {

	/* san-diego-chargers */
	app.get('/san-diego-chargers', function(req, res) {
		res.render('landing-pages/san-diego-chargers', {});
	});


	app.get('/partials/san-diego-chargers', function(req, res) {
		res.render('partials/landing-pages/san-diego-chargers', {});
	});

};