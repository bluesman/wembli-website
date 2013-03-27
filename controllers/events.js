var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');
require('date-utils');
var eventRpc      = require('../rpc/event').event;

module.exports = function(app) {

	/* use case: visitor.context = 'visitor' trying to view the event details */
	app.get('/event/:eventId/:eventName',function(req,res) {
		res.render('event-detail');
	});

	app.get('/partials/event/:eventId/:eventName',function(req,res) {
		res.render('partials/event-detail');
	});

	/*
	use case 3a: its someone who may have been invited
	they need to log in and then if their 'id' matches the id of the friend that has this token
	then they are the one that was invited...if it doesn't match then its a random
	so just send them to event-detail
	*/


	/* event-options */
	var viewOptionsForm = function(req,res,template,locals) {
		var showOptionsForm = function() {
			req.session.plan.event.eventId   = req.param('eventId');
			req.session.plan.event.eventName = req.param('eventName');

			/* reset the eventOptionsForm */
			locals.eventId = req.param('eventId');
			locals.eventName = req.param('eventName');
			return res.render(template,locals);
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
		if ((req.session.visitor.context === 'visitor') && (typeof req.session.plan.organizer === "undefined")) {
			console.log('showing options form');
			/* show them the options page too */
			return showOptionsForm();
		}
		console.log('redirect');
		/* if its any other condition they should not be here so redirect them to the /event/ page for this event */
		var redirect = '/event/'+req.param('eventId')+'/'+req.param('eventName');
		return res.redirect(redirect);
	};

	//use case 1a: its either a incoming link (bot) or the user hitting refresh
	app.get('/event-options/:eventId/:eventName',function(req,res) { return viewOptionsForm(req,res,'event-options',{}); });

	//use case 1b: load the partial that displays event options
	app.get('/partials/event-options/:eventId/:eventName',function(req,res) { return viewOptionsForm(req, res, 'partials/event-options', {}) });

	app.get('/partials/includes/event/hero',function(req,res) {
		res.render('partials/includes/event/hero');
	});

	/*
	  post the submit for the plan options
	*/
	app.post('/event-options/:eventId/:eventName',function(req,res) {

		//go through the options and add them to the current plan
		var options = {};

		//set the form data in the session so the angular app can read any errors
		req.session.eventOptionsForm = {
			parking:      req.param('parking') ? true : false,
			restaurant:   req.param('restaurant') ? true : false,
			hotel:        req.param('hotel') ? true : false,
			guestFriends: req.param('guest_friends') ? true : false,
			over21:       req.param('over_21') ? true : false,
			guestList:    req.param('guest_list'),
			errors:       {}
		};

		//add-ons
		//parking, restaurant or hotel
		options.addOns = {
			'parking':false,
			'restaurant':false,
			'hotel':false
		}

		if (typeof req.param('parking') !== "undefined") {
			options.addOns.parking = req.param('parking');
		}
		if (typeof req.param('restaurant') !== "undefined") {
			options.addOns.restaurant = req.param('restaurant');
		}
		if (typeof req.param('hotel') !== "undefined") {
			options.addOns.hotel = req.param('hotel');
		}


		//invite options: guest_friends, over_21
		options.inviteOptions = {
			'guestFriends':true, //guests are allowed to invite friends
			'over21': false //lets guests know kids are not invited
		}

		if (typeof req.param('guest_friends') !== "undefined") {
			options.inviteOptions.guestFriends = req.param('guest_friends');
		}
		if (typeof req.param('over_21') !== "undefined") {
			options.inviteOptions.over21 = req.param('over_21');
		}


		//guest list privacy options: full, rsvp, private
		if ((req.param('guest_list') === 'full') ||
			  (req.param('guest_list') === 'rsvp') ||
			  (req.param('guest_list') === 'private')
			  ) {
			options.guestList = req.param('guest_list');
		} else {
			req.session.eventOptionsForm.errors.guestList = true;
		}

		if (Object.keys(req.session.eventOptionsForm.errors).length > 0) {
			//render the event options form again with errors
			return res.render('partials/event-options',{
				eventId:req.param('eventId'),
				eventName:req.param('eventName')
			});
		}

		options.payment = req.session.plan.preferences.payment;

		/* if this visitor already has a req.session.plan and they are the organizer and it is the same eventId as req.session.eventId
		then override only the preferences */
		if ((req.session.visitor.context === "organizer") ||
			((req.session.visitor.context === 'visitor') && (typeof req.session.plan.organizer === "undefined"))	) {
			/* let them save the options to their plan */
			req.session.plan.preferences = options;

			/* set a special header to tell angular to update the browser location */
			res.setHeader('x-wembli-location','/invitation');
			return res.render('partials/plan',{partial:true});
		}

		/* else they are not allowed to change the options, redirect to event view */
		var redirect = '/event/'+req.param('eventId')+'/'+req.param('eventName');
		return res.redirect(redirect);
	});

}
