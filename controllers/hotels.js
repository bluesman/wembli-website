var gg = require('../lib/wembli/google-geocode');
var async = require('async');
var venueRpc    = require('../rpc/venue').venue;
var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');

module.exports = function(app) {

	app.get('/hotels', function(req, res) {
		res.render('no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});

	app.get('/partials/hotels', function(req, res) {
		res.render('no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});


	app.get('/hotels/:eventId/:eventName/login/:service/:hotelId', function(req, res) {
		return res.redirect('/hotels/' + req.param('eventId') + '/' + req.param('eventName') + '#hotels-login-modal-' + req.param('service') + '-' + req.param('hotelId'));
	});


	var initRestaurantView = function(req, res, callback) {

		var locals = {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		}

		/* if there already is a venue - don't need to get one */
		var args = {VenueID:req.session.plan.venue.venueId};
		venueRpc['get'].apply(function(err,results) {
			var address = results.venue[0].Street1 + ', ' + req.session.plan.event.eventCity + ', ' + req.session.plan.event.eventState;
			gg.geocode(address,function(err,geocode) {
				if (typeof geocode !== "undefined") {
					req.session.plan.venue.data.geocode = geocode[0];
					locals.lat = geocode[0].geometry.location.lat;
					locals.lon = geocode[0].geometry.location.lng;
				}
				callback(req,res,locals);
			});
		},[args,req,res]);

	};

	app.get('/hotels/:eventId/:eventName',function(req,res) {
		if (typeof req.session.plan === "undefined") {
			return res.render('no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}
		initRestaurantView(req,res, function(req,res,locals) {
			res.render('hotels', locals);
		});
	});

	app.get('/partials/hotels/:eventId/:eventName',function(req,res) {
		if (typeof req.session.plan === "undefined") {
			return res.render('partials/no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}
		initRestaurantView(req,res, function(req,res,locals) {
			res.render('partials/hotels', locals);
		});
	});
}
