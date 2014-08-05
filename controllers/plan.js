var gg = require('../lib/wembli/google-geocode');
var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Friend = wembliModel.load('friend'),
	Plan = wembliModel.load('plan');

module.exports = function(app) {

	app.get(/^\/plan\/?(itinerary|vote|invitees|pony-up|rsvp|cart|chatter|send-pony-up)?$/, function(req, res) {


		var locals = {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			jsIncludes:['/js/plan.min.js','//maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&libraries=places'],
			plan: req.session.plan,
			lat: req.session.plan.venue.data.geocode.geometry.location.lat,
			lon: req.session.plan.venue.data.geocode.geometry.location.lng,
		}

		if (!req.session.customer) {
			req.session.loginRedirect = true;
			req.session.redirectUrl   = req.url;
			return res.redirect('/login');
		}

		/* they are logged in - do some housekeeping */
		delete req.session.redirectUrl;
		req.session.loginRedirect = false;

		/* if there's no event send to the no event page */
		if ((typeof req.session.plan == "undefined") || (typeof req.session.plan.event.eventId === "undefined")) {
			return res.render('no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}

		console.log('load section: ' + req.params[0]);
		var section = req.params[0];

		/* different logic depending on context */
		var context = {
			'organizer' : function() {
				/* what page to load if there is no section set
				 * if there's a plan and rsvp is complete, then go to cart
				 * else go to rsvp
				*/
				if (!section) {
					if (req.session.plan.rsvpComplete) {
						section = 'cart';
					}
				}

			},
			'friend' : function() {

			},
			'visitor' : function() {

			}
		}

		/* run the context specific function */
		context[req.session.visitor.context]();

		if (!section) {
			section = 'rsvp';
		}

		var view = 'plan/' + req.session.visitor.context + '/' + section;
		res.render(view, locals);
	});


	/* old ---- */


	/*
	app.get('/partials/plan', function(req, res) {
		// if there's no event send to the no event page
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
	*/

	app.get('/plan/:guid/:section?', function(req, res) {

		if (!req.session.customer) {
			req.session.redirectUrl = '/plan/' + req.param('guid') + '/' + req.param('section');
			return res.redirect('/login');
		}

		/* must make sure that this customer is allowed to view this plan */
		var foundPlan = function(err, p) {
			console.log('found plan');
			console.log(p);
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
				console.log('found friend invited to plan');
				console.log(f);

				Plan.findOne({
					guid: req.param('guid')
				}, foundPlan);
			});
		}
	});

	/*
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
	*/
}
