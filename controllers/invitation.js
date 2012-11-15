module.exports = function(app) {

	app.get('/invitation', function(req, res) {
		res.render('invitation', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});

	});
}
