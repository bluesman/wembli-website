var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');
var eventRpc      = require('../rpc/event').event;
var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');


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


	var ticketsView = function(req,res,template,locals) {
		var args = {"eventID" : req.param("eventId")};
		eventRpc['get'].apply(function(err,results) {
			/* its possible that this event is no longer available - if that is the case, send them to the no-event page */
			if (err || !results.event[0]) {
				console.log('no event from tn: '+err);
				var noEventUrl = locals.partial ? '/partials/tickets' : '/tickets';
				return res.redirect(noEventUrl);
			}

			res.setHeader('x-wembli-overflow','hidden');
			res.setHeader('x-wembli-location','/tickets/'+req.param("eventId")+'/'+req.param("eventName"));

			locals.tnMapUrl  = results.event[0].MapURL;

			/* friends just get to view */
			if (req.session.visitor.context === 'friend') {
				return res.render(template, locals);
			}

			if (typeof req.session.plan === "undefined") {
				req.session.plan = new Plan({guid: Plan.makeGuid()});
				req.session.plan.event.eventId    = req.param("eventId");
				req.session.plan.event.eventName  = req.param("eventName");
				req.session.plan.event.eventDate  = results.event[0].Date;
				req.session.plan.event.eventVenue = results.event[0].Venue;
				req.session.plan.event.eventCity  = results.event[0].City;
				req.session.plan.event.eventState = results.event[0].StateProvince;
				req.session.plan.event.data       = results.event[0];
				req.session.plan.preferences.payment = 'split-first';
				/* you are now the organizer */
				req.session.visitor.context = 'organizer';
			}

			console.log('plan in tickets controller');
			console.log(req.session.plan);

			/* if they don't have a plan or this event is different
				than the current plan then over write the plan
				save prefs only if the customer is logged in */
			if (typeof req.session.plan !== "undefined" &&
					typeof req.session.plan.event !== "undefined" &&
					(req.session.plan.event.eventId !== req.param("eventId"))) {

				/* if they are the plan organizer, safe their prefs - thy ar ejust changing plans */
				if (req.session.visitor.context === "organizer") {
					var savePrefs = req.session.plan.preferences;
				}

				/* overwrite the existing plan keeping the prefs but nothing else */
				req.session.plan = new Plan({guid: Plan.makeGuid()});

				if (savePrefs) {
					req.session.plan.preferences = {payment:savePrefs.payment};
					req.session.plan.preferences.tickets = savePrefs.tickets;
				}

				req.session.plan.event.eventId    = req.param("eventId");
				req.session.plan.event.eventName  = req.param("eventName");
				req.session.plan.event.eventDate  = results.event[0].Date;
				req.session.plan.event.eventVenue = results.event[0].Venue;
				req.session.plan.event.eventCity  = results.event[0].City;
				req.session.plan.event.eventState = results.event[0].StateProvince;
				req.session.plan.event.data       = results.event[0];

				/* you are now the organizer */
				req.session.visitor.context = 'organizer';

			}

			res.render(template, locals);
		},[args,req,res]);

	};

	app.get('/tickets/:eventId/:eventName', function(req, res) {
		return ticketsView(req,res,'tickets',{
			title:'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			fixedHeight:true
		});
	});

	app.get('/partials/tickets/:eventId/:eventName', function(req, res) {
		return ticketsView(req,res,'partials/tickets',{partial:true})
	});

}
