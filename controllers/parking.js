module.exports = function(app) {
	app.get('/parking', function(req, res) {
		res.render('parking', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});
}
