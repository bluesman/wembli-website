var gg = require('../lib/wembli/google-geocode');
var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Plan = wembliModel.load('plan');

module.exports = function(app) {

	var initPlanView = function(req, res, callback) {

		var locals = {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			plan: req.session.plan
		}

		//TODO - handle this in a more global way
		//if they are logged in then clear out any redirectUrl that may have been set
		if (req.session.loggedIn) {
			delete req.session.redirectUrl;
			req.session.loginRedirect = false;
		} else {
			//they're going to get a login overlay if they aren't logged in - set the redirectUrl here
			req.session.redirectUrl = '/plan';
			req.session.loginRedirect = true;
		}
		callback(req, res, locals)
	};

	app.get('/plan', function(req, res) {
		/* if there's no event send to the no event page */
		if ((typeof req.session.plan == "undefined") || (typeof req.session.plan.event.eventId === "undefined")) {
			return res.render('no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}

		initPlanView(req, res, function(req, res, locals) {
			res.render('plan', locals);
		});
	});

	app.get('/partials/plan', function(req, res) {
		/* if there's no event send to the no event page */
		if ((typeof req.session.plan == "undefined") || (typeof req.session.plan.event.eventId === "undefined")) {
			return res.render('partials/no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}

		initPlanView(req, res, function(req, res, locals) {
			res.render('partials/plan', locals);
		});
	});

	app.get(/^\/partials\/modals\/organizer-dashboard$/, function(req, res) {
		return res.render('partials/modals/organizer-dashboard', {
			partial: true
		});
	});

	app.get(/^\/partials\/plan\/chatter$/, function(req, res) {
		return res.render('partials/plan/chatter', {
			partial: true
		});
	});

	app.get(/^\/partials\/plan\/(nav|dashboard|feed|itinerary-section|pony-up-section|rsvp-section|cart-section)$/, function(req, res) {
		console.log(req.session.plan.venue);

		/* last minute check for geometry */
		if (typeof req.session.plan.venue.data.geocode === "undefined") {
			var address = req.session.plan.venue.data.Street1 + ', ' + req.session.plan.event.eventCity + ', ' + req.session.plan.event.eventState;
			gg.geocode(address, function(err, geocode) {
				req.session.plan.venue.data.geocode = geocode[0];
				console.log(geocode);
				req.session.plan.save(function() {
					return res.render('partials/plan/' + req.session.visitor.context + '-' + req.url.split('/')[3], {
						lat: req.session.plan.venue.data.geocode.geometry.location.lat,
						lon: req.session.plan.venue.data.geocode.geometry.location.lng,
						partial: true
					});

				});
			});
		} else {
			return res.render('partials/plan/' + req.session.visitor.context + '-' + req.url.split('/')[3], {
				lat: req.session.plan.venue.data.geocode.geometry.location.lat,
				lon: req.session.plan.venue.data.geocode.geometry.location.lng,
				partial: true
			});

		}

	});

	/* does this ever get called? */
	app.get('/plan/:guid', function(req, res) {
		Plan.findOne({
			guid: req.param('guid')
		}, function(err, p) {
			if (!p) {
				return res.redirect('/');
			};
			req.session.plan = p;
			res.redirect('/plan');
		});
	});

	app.get('/partials/plan/:guid', function(req, res) {
		Plan.findOne({
			guid: req.param('guid')
		}, function(err, p) {
			if (!p) {
				return res.redirect('/');
			};
			req.session.plan = p;
			res.redirect('/partials/plan');
		});
	});

}
