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

	app.get('/tickets/:eventId/:eventName', function(req, res) {
		var args = {"eventID":req.param("eventId")};
		//get nearby events:
		eventRpc['get'].apply(function(err,results) {
			console.log('results from eventrpc: ');
			console.log(results.event[0]);

			res.render('tickets', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
				eventId:req.param('eventId'),
				eventName:req.param('eventName'),
				tnMapUrl:results.event[0].MapURL
			});


		},[args,req,res]);
	});

	app.get('/partials/tickets/:eventId/:eventName', function(req, res) {
		var args = {"eventID":req.param("eventId")};

		/* get the event data for the tn map url */
		eventRpc['get'].apply(function(err,results) {
			console.log('results from eventrpc: ');
			console.log(results.event[0]);

			res.render('partials/tickets', {
				eventId:req.param('eventId'),
				eventName:req.param('eventName'),
				tnMapUrl:results.event[0].MapURL
			});

		},[args,req,res]);

	});

}
