module.exports = function(app) {
	app.get('/hotels', function(req, res) {
		res.render('hotels', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});
}
