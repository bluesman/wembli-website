var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');
var eventRpc      = require('../rpc/event').event;

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
		console.log('tickets view: '+req.param("eventId"));
		req.session.plan.event.eventId   = req.param("eventId");
		req.session.plan.event.eventName = req.param("eventName");

		eventRpc['get'].apply(function(err,results) {
			console.log(results);
			req.session.plan.event.eventDate = results.event[0].Date;
			req.session.plan.event.eventVenue = results.event[0].Venue;
			req.session.plan.event.eventCity = results.event[0].City;
			req.session.plan.event.data = results.event[0];
			//set a special header to tell angular to update the browser location
			res.setHeader('x-wembli-overflow','hidden');
			locals.tnMapUrl  = results.event[0].MapURL;

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
