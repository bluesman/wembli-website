var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');
var eventRpc = require('../rpc/event').event;
var venueRpc = require('../rpc/venue').venue;
var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Plan = wembliModel.load('plan');


module.exports = function(app) {
	//if no event is defined just show the teaser telling them to search and pick an event
	app.get('/tickets', function(req, res) {
		res.render('no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});

	app.get('/partials/tickets', function(req, res) {
		res.render('partials/no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});


	var ticketsView = function(req, res, template, locals) {
		var args = {
			"eventID": req.param("eventId")
		};
		eventRpc['get'].apply(function(err, results) {
			var venueId = '';
			/* its possible that this event is no longer available - if that is the case, send them to the no-event page */
			if (err || !results.event[0]) {
				if (req.session.plan.venue.venueId) {
					/* if we have the event in the session use that instead */
					venueId = req.session.plan.venue.venueId;
				} else {
					console.log('no event from tn: ' + err);
					var noEventUrl = locals.partial ? '/partials/tickets' : '/tickets';
					return res.redirect(noEventUrl);
				}
			} else {
				venueId = results.event[0].VenueID;
			}

			/* get the venue data for this event */
			venueRpc['get'].apply(function(err, venueResults) {
				console.log('back from venue rpc');
				console.log(err);
				console.log(venueResults);
				res.setHeader('x-wembli-overflow', 'hidden');
				res.setHeader('x-wembli-location', '/tickets/' + req.param("eventId") + '/' + req.param("eventName"));

				locals.tnMapUrl = results.event[0] ? results.event[0].MapURL : req.session.plan.event.data.MapURL;

				/* friends just get to view */
				if (req.session.visitor.context === 'friend') {
					return res.render(template, locals);
				}

				if (!results.event[0]) {
					return res.render(template, locals);
				}

				if (typeof req.session.plan === "undefined") {
					req.session.plan = new Plan({
						guid: Plan.makeGuid()
					});
					req.session.plan.event.eventId = req.param("eventId");
					req.session.plan.event.eventName = req.param("eventName");
					req.session.plan.event.eventDate = results.event[0].Date;
					req.session.plan.event.eventVenue = results.event[0].Venue;
					req.session.plan.event.eventCity = results.event[0].City;
					req.session.plan.event.eventState = results.event[0].StateProvince;
					req.session.plan.event.data = results.event[0];
					req.session.plan.venue.venueId = results.event[0].VenueID;
					req.session.plan.venue.data = venueResults.venue[0];
					req.session.plan.preferences.payment = 'split-first';
					/* you are now the organizer */
					req.session.visitor.context = 'organizer';
				}

				console.log('plan in tickets controller');
				console.log(req.session.plan);

				/* if they do have a plan but this event is different
				than the current plan then over write the plan
				save prefs only if the customer is logged in */
				if (typeof req.session.plan !== "undefined" && typeof req.session.plan.event !== "undefined" && (req.session.plan.event.eventId !== req.param("eventId"))) {

					/* if they are the plan organizer, safe their prefs - thy ar ejust changing plans */
					if (req.session.visitor.context === "organizer") {
						var savePrefs = req.session.plan.preferences;
					}

					var newPlan = function() {
						/* overwrite the existing plan keeping the prefs but nothing else */
						console.log('creating new plan in tickets controller');
						req.session.plan = new Plan({
							guid: Plan.makeGuid()
						});

						if (savePrefs) {
							req.session.plan.preferences = {
								payment: savePrefs.payment
							};
							req.session.plan.preferences.tickets = savePrefs.tickets;
						}
						req.session.plan.event.eventId = req.param("eventId");
						req.session.plan.event.eventName = req.param("eventName");
						req.session.plan.event.eventDate = results.event[0].Date;
						req.session.plan.event.eventVenue = results.event[0].Venue;
						req.session.plan.event.eventCity = results.event[0].City;
						req.session.plan.event.eventState = results.event[0].StateProvince;
						req.session.plan.event.data = results.event[0];
						req.session.plan.venue.venueId = results.event[0].VenueID;
						req.session.plan.venue.data = venueResults.venue[0];
						/* you are now the organizer */
						req.session.visitor.context = 'organizer';
						return res.render(template, locals);
					};

					/* if there is a customer check for an existing plan for this event and use that */
					if (req.session.customer) {
						Plan.findOne()
						.where('organizer').equals(req.session.customer._id)
						.where('event.eventId').equals(req.param("eventId")).exec(function(err,p) {
							if (p === null) {
								return newPlan();
							}
							console.log('this customer has a plan for this event already');
							console.log(err);
							console.log(p);
							req.session.plan = p;
							return res.render(template, locals);
						});
					}	else {
						newPlan();
					}
				} else {

					return res.render(template, locals);
				}
			}, [{VenueID:venueId}, req, res]);
		}, [args, req, res]);

	};

	app.get('/tickets/:eventId/:eventName/login/:ticketId', function(req, res) {
		return res.redirect('/tickets/' + req.param('eventId') + '/' + req.param('eventName') + '#tickets-login-modal-' + req.param('ticketId'));
	});

	app.get('/tickets/:eventId/:eventName', function(req, res) {
		return ticketsView(req, res, 'tickets', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			fixedHeight: true
		});
	});

	app.get('/partials/tickets/:eventId/:eventName', function(req, res) {
		return ticketsView(req, res, 'partials/tickets', {
			partial: true
		})
	});

}
