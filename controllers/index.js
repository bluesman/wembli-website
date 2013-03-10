
module.exports = function(app) {

	app.get('/', function(req, res) {

		res.render('index', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});

	});

	app.get('/terms-policies', function(req, res) {
		res.render('terms-policies.jade', {
			title: 'wembli.com - Terms & Policies.'
		});

	});


	app.get('/style-guide', function(req, res) {
		res.render('style-guide.jade', {
			title: 'wembli.com - we got style yo!'
		});
	});
};

