module.exports = function(app) {

	app.get('/restaurants', function(req, res) {
		res.render('no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});

	app.get('/partials/restaurants', function(req, res) {
		res.render('no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});

	var initRestaurantView = function(req, res, callback) {

		var locals = {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		}

		callback(req,res,locals)
	};









	app.get('/restaurants/:eventId/:eventName',function(req,res) {
		initRestaurantView(req,res, function(req,res,locals) {
			res.render('restaurants', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		});
	});

	app.get('/partials/restaurants/:eventId/:eventName',function(req,res) {
		initRestaurantView(req,res, function(req,res,locals) {
			res.render('partials/restaurants', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		});
	});
}
