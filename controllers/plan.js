var gg = require('../lib/wembli/google-geocode');
var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Friend = wembliModel.load('friend'),
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

	app.get(/^\/partials\/modals\/friend-dashboard$/, function(req, res) {
		return res.render('partials/modals/friend-dashboard', {
			partial: true
		});
	});

	app.get(/^\/partials\/plan\/chatter$/, function(req, res) {
		return res.render('partials/plan/chatter', {
			partial: true
		});
	});

	app.get(/^\/partials\/plan\/(nav|dashboard|feed|itinerary-section|vote-section|invitees-section|pony-up-section|rsvp-section|cart-section)$/, function(req, res) {

		/* last minute check for geometry */
		if (typeof req.session.plan.venue.data.geocode === "undefined") {
			var address = req.session.plan.venue.data.Street1 + ', ' + req.session.plan.event.eventCity + ', ' + req.session.plan.event.eventState;
			gg.geocode(address, function(err, geocode) {
				req.session.plan.venue.data.geocode = geocode[0];
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

	app.get('/plan/:guid/:section?', function(req, res) {

		if (!req.session.customer) {
			req.session.redirectUrl = '/plan/' + req.param('guid') + '/' + req.param('section');
			return res.redirect('/login');
		}

		/* must make sure that this customer is allowed to view this plan */
		var foundPlan = function(err, p) {
			if (!p) {
				return res.redirect('/dashboard');
			};
			req.session.plan = p;
			var url = '/plan';
			if (req.param('section')) {
				url = url + '#section' + req.param('section');
			}
			res.redirect(url);
		};

		/* is the guid something this customer is planning? */
		var planFound = false;
		for (var i = 0; i < req.session.customer.plans.length; i++) {
			var g = req.session.customer.plans[i];
			if (g === req.param('guid')) {
				planFound = true;
				var query = {"guid":req.param('guid')};
				Plan.findOne(query, foundPlan);
				break;
			}
		};
		if (!planFound) {
			/* still here? check if this customer is invited to the plan */
			Friend.findOne({
				planGuid: req.param('guid'),
				customerId: req.session.customer.id
			}, function(err, f) {
				if (!f) {
					return res.redirect('/dashboard');
				};
				Plan.findOne({
					guid: req.param('guid')
				}, foundPlan);
			});
		}
	});

	app.get('/partials/plan/:guid/:section?', function(req, res) {
		if (!req.session.customer) {
			req.session.redirectUrl = '/plan/' + req.param('guid') + '/' + req.param('section');
			return res.redirect('/partials/login');
		}

		Plan.findOne({
			guid: req.param('guid')
		}, function(err, p) {
			if (!p) {
				return res.redirect('/partials/dashboard');
			};
			req.session.plan = p;
			res.redirect('/partials/plan');
		});
	});

}
