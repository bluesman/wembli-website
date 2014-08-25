var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');
require('date-utils');
var eventRpc = require('../rpc/event').event;

module.exports = function(app) {

	/* use case: visitor.context = 'visitor' trying to view the event details */
	/* deprecated ?
	app.get('/event/:eventId/:eventName', function(req, res) {
		res.render('event-detail');
	});

	app.get('/partials/event/:eventId/:eventName', function(req, res) {
		res.render('partials/event-detail');
	});
	*/

	/*
	use case 3a: its someone who may have been invited
	they need to log in and then if their 'id' matches the id of the friend that has this token
	then they are the one that was invited...if it doesn't match then its a random
	so just send them to event-detail
	*/


	/* event-options */
	var viewOptionsForm = function(req, res, template, locals) {
		var showOptionsForm = function() {
			req.session.plan.event.eventId = req.param('eventId');
			req.session.plan.event.eventName = req.param('eventName');

			/* reset the eventOptionsForm */
			locals.eventId = req.param('eventId');
			locals.eventName = req.param('eventName');
			locals.jsIncludes = ['/js/event-options.min.js'];
			return res.render(template, locals);
		};

		/*
		- if they're in organizer context - let them view the options
		- if they are new customers in the middle of planning a new event - let them view the options
		- otherwise redirect to the event view
		*/

		/* if its organizer context, change the plan */
		if (req.session.visitor.context === 'organizer') {
			return showOptionsForm();
		}

		/* if its visitor context but plan.organizer is undefined this is a new customer planning right now */
		if ((req.session.visitor.context === 'visitor') && (typeof req.session.plan.organizer.customerId === "undefined")) {
			/* show them the options page too */
			return showOptionsForm();
		}
		/* if its any other condition they should not be here so redirect them to the /event/ page for this event */
		var redirect = '/event/' + req.param('eventId') + '/' + req.param('eventName');
		return res.redirect(redirect);
	};

	//use case 1a: its either a incoming link (bot) or the user hitting refresh
	app.get('/event-options/:eventId/:eventName', function(req, res) {

		if (typeof req.session.plan === "undefined") {
		    return res.status(404).render('error/404');
		}

		return viewOptionsForm(req, res, 'event-options', {});
	});

}
