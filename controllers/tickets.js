var ticketNetwork = require('../lib/wembli/ticketnetwork');
var gg = require('../lib/wembli/google-geocode');
var async = require('async');
var eventRpc = require('../rpc/event').event;
var venueRpc = require('../rpc/venue').venue;
var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Ticket = wembliModel.load('ticket'),
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
					var noEventUrl = locals.partial ? '/partials/tickets' : '/tickets';
					return res.redirect(noEventUrl);
				}
			} else {
				venueId = results.event[0].VenueID;
			}

			console.log('create new plan?');
			console.log(req.session.plan);

			/* TODO: convert this to call planRpc.startPlan() */

			/* get the venue data for this event - why do this if i already did? */
			venueRpc['get'].apply(function(err, venueResults) {
				res.setHeader('x-wembli-overflow', 'hidden');
				res.setHeader('x-wembli-location', '/tickets/' + req.param("eventId") + '/' + req.param("eventName"));

				var address = venueResults.venue[0].Street1 + ', ' + venueResults.venue[0].City + ', ' + venueResults.venue[0].StateProvince + ' ' + venueResults.venue[0].ZipCode;
				gg.geocode(address, function(err, geocode) {

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
						if (typeof geocode !== "undefined") {
							req.session.plan.venue.data.geocode = geocode[0];
						}

						/* you are now the organizer */
						req.session.visitor.context = 'organizer';
					}

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
							if (typeof geocode !== "undefined") {
								req.session.plan.venue.data.geocode = geocode[0];
							}

							/* you are now the organizer */
							req.session.visitor.context = 'organizer';
							return res.render(template, locals);
						};

						/* if there is a customer check for an existing plan for this event and use that */
						if (req.session.customer) {
							Plan.findOne()
								.where('organizer').equals(req.session.customer._id)
								.where('event.eventId').equals(req.param("eventId")).exec(function(err, p) {
									if (p === null) {
										return newPlan();
									}
									req.session.plan = p;
									return res.render(template, locals);
								});
						} else {
							newPlan();
						}
					} else {
						req.session.plan.venue.data.geocode = geocode[0];
						return res.render(template, locals);
					}

				});
			}, [{
					VenueID: venueId
				},
				req, res
			]);
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

	app.get('/partials/interactive-venue-map', function(req, res) {
		/* get any purchased tickets for this plan */
		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
		};

		/* right now - you can only have 1 un-purchased ticket group..so remove any tickets that are unpurchased from the plan */

		/* find all the existing tickets for this plan */
		Ticket.find(query, function(err, tickets) {

			var ticketsPurchased = [];
			/* check if these tickets are purchased */
			async.forEach(tickets, function(item, callback) {
					if (item.purchased) {
						ticketsPurchased.push(item);
					}
					callback();
				},
				function() {
					console.log('tickets purchased:');
					console.log(ticketsPurchased);
					return res.render('partials/interactive-venue-map',{ticketsPurchased:ticketsPurchased});
				});
		});
	});
	app.get('/partials/modals/tickets-modals', function(req, res) {
		return res.render('partials/modals/tickets-modals');
	});

}
