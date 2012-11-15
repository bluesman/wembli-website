var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');

module.exports = function(app) {
	//if no event is defined just show the teaser telling them to search and pick an event
	app.get('/tickets', function(req, res) {
		res.render('tickets-teaser', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});

	app.get('/tickets/:eventId/:eventName', function(req, res) {

		res.render('tickets', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			jsIncludes:["/js/plugins/excanvas.js","/js/plugins/jquery.tuMap.js"],
			eventId:req.param('eventId'),
			eventName:req.param('eventName')
		});
	});



}
