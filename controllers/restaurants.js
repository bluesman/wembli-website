module.exports = function(app) {
	app.get('/restaurants', function(req, res) {
		res.render('restaurants', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});
}
