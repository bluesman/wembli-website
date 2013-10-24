var wembliUtils = require('../lib/wembli/utils');

module.exports = function(app) {

	/* san-diego-chargers */
	app.get('/san-diego-chargers', function(req, res) {
		res.render('landing-pages/san-diego-chargers', {});
	});


	app.get('/partials/san-diego-chargers', function(req, res) {
		res.render('partials/landing-pages/san-diego-chargers', {});
	});

	/* george-straight */
	app.get('/george-strait', function(req, res) {
		res.render('landing-pages/george-strait', {});
	});

	app.get('/partials/george-strait', function(req, res) {
		res.render('partials/landing-pages/george-strait', {});
	});

};
