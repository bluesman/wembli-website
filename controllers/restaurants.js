var sg = require('../lib/wembli/seatgeek');
var gg = require('../lib/wembli/google-geocode');
var async = require('async');
var venueRpc = require('../rpc/venue').venue;
var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Restaurant = wembliModel.load('restaurant'),
	Plan = wembliModel.load('plan');


module.exports = function(app) {
	app.get('/restaurants', function(req, res) {
		res.render('no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});

	app.get('/partials/restaurants', function(req, res) {
		res.render('partials/no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});

	app.get('/restaurants/:eventId/:eventName/login/:service/:restaurantId', function(req, res) {
		return res.redirect('/restaurants/' + req.param('eventId') + '/' + req.param('eventName') + '#restaurants-login-modal-' + req.param('service') + '-' + req.param('restaurantId'));
	});


	var initRestaurantView = function(req, res, callback) {

		var locals = {};
		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
		};

		/* find all the existing deals for this plan  */
		Restaurant.find(query, function(err, restaurants) {

			var dealsPurchased = [];
			/* check if parking is purchased */
			async.forEach(restaurants, function(item, callback) {
					/* check if any of these are not yet purchased and remove them */
					if (item.purchased) {
						dealsPurchased.push(item);
					}
					callback();
				},
				function() {
					locals.dealsPurchased = dealsPurchased;
					/* if there already is a venue - don't need to get one */

					if (typeof req.session.plan.venue.data.geocode === "undefined") {

						var args = {
							VenueID: req.session.plan.venue.venueId
						};

						venueRpc['get'].apply(function(err, results) {
							var address = results.venue[0].Street1 + ', ' + req.session.plan.event.eventCity + ', ' + req.session.plan.event.eventState;
							gg.geocode(address, function(err, geocode) {
								if (typeof geocode !== "undefined") {
									req.session.plan.venue.data.geocode = geocode[0];
									locals.lat = geocode[0].geometry.location.lat;
									locals.lon = geocode[0].geometry.location.lng;
								}
								callback(req, res, locals);
							});
						}, [args, req, res]);
					} else {
						locals.lat = req.session.plan.venue.data.geocode.geometry.location.lat;
						locals.lng = req.session.plan.venue.data.geocode.geometry.location.lng;
						callback(req, res, locals);
					}
				});
		});
	};

	app.get('/restaurants/:eventId/:eventName', function(req, res) {
		if (typeof req.session.plan === "undefined") {
			return res.render('no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}
		initRestaurantView(req, res, function(req, res, locals) {
			res.render('restaurants', locals);
		});
	});

	app.get('/partials/restaurants/:eventId/:eventName', function(req, res) {
		if (typeof req.session.plan === "undefined") {
			return res.render('partials/no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}
		initRestaurantView(req, res, function(req, res, locals) {
			locals.partial = true;
			res.render('partials/restaurants', locals);
		});
	});

	app.get('/partials/modals/restaurants-modals', function(req, res) {
		return res.render('partials/modals/restaurants-modals');
	});
}
