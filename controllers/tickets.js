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

			/* if the plan in session plan has already been saved, don't overwrite it */
			if (req.session.plan && req.session.plan.id) {
				var savePrefs = req.session.plan.preferences;
				req.session.plan = new Plan({guid: Plan.makeGuid()});
				req.session.plan.preferences = savePrefs;
			}

			req.session.plan.event.eventId    = req.param("eventId");
			req.session.plan.event.eventName  = req.param("eventName");
			req.session.plan.event.eventDate  = results.event[0].Date;
			req.session.plan.event.eventVenue = results.event[0].Venue;
			req.session.plan.event.eventCity  = results.event[0].City;
			req.session.plan.event.eventState = results.event[0].StateProvince;
			req.session.plan.event.data       = results.event[0];

			//set a special header to tell angular to update the browser location
			res.setHeader('x-wembli-overflow','hidden');
			locals.tnMapUrl  = results.event[0].MapURL;
			console.log('req session event in tickets view');
			console.log(req.session.plan.event);
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
