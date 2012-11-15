var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');
require('date-utils');
var eventRpc      = require('../rpc/event').event;

module.exports = function(app) {

	app.get('/venue/:mapType/:mapId',function(req,res) {
		var args = {eventID: "1863672"};
		eventRpc['getTickets'].apply(function(err,results) {
			console.log('results from eventrpc: ');
			console.log(results);
			res.render('test',{
				//jsIncludes:["/js/plugins/excanvas.js","/js/plugins/jquery.tuMap.js"],
				jsIncludes:["/js/plugins/excanvas.js","http://chart.demo.ticketutils.com/js/jquery.tuMap.js"],
				//tickets:results.tickets,
				//event:results.event
				mapId:req.param('mapId'),
				mapType:req.param('mapType')
			});
		},[args,req,res]);

	});

	/*
		the following functions handle the initial event selection..the flow is something like this:
		use case 1:
			- user clicks an upcoming event from the home page or clicks an event from the search results
			- this results in a request to load a partial to fill the slide in frame
			- in this use case, we know that the user has actively clicked a link on a page and are sliding into the next page
			- therefore, we will start the event plan and show the event options page
		use case 2:
			- page is loaded from a book mark, or something other than a click..this could be a user or a bot
			- in this case, we will not show the event options, instead we'll show details about the event
			- there will be 2 navigation options:
				- a. if they are just a random, there will be a link to start planning the event
				- b. if they come in with a token, check to see if they are invited to the plan - if so they can log in
	*/

	//use case 1: load the partial that displays event options
	app.get('/partials/event/:eventId/:eventName',function(req,res) {

		//if this is being called - it means they clicked an event to start planning it..
		//store the eventId in the session in case we need it later
		req.session.currentPlan = {}; //start a new currentPlan
		req.session.currentPlan.eventId = req.param('eventId');
		//clear the eventOptionsForm
		delete req.session.eventOptionsForm;


		res.render('partials/event-options',{
			eventId:req.param('eventId'),
			eventName:req.param('eventName')
		})
	});

	//use case 2a: load the event-detail view - its a bot or a random
	app.get('/event/:eventId/:eventName',function(req,res) {
		//if they are planning this event load the event options
		if ((typeof req.session.currentPlan !== "undefined") && (req.param('eventId') === req.session.currentPlan.eventId)) {
			res.render('event-options',{
				eventId:req.param('eventId'),
				eventName:req.param('eventName')
			});
		} else {
			res.render('event-detail');
		}
	});

	app.get('/partials/includes/event/hero',function(req,res) {
		res.render('partials/includes/event/hero');
	});

	//TODO: use case 2b: its someone who may have been invited
	//they need to log in and then if their 'id' matches the id of the friend that has this token
	//then they are the one that was invited...if it doesn't match then its a random
	//so just send them to event-detail
	app.get('/event/:eventId/:eventName/:guid/:token',function(req,res) {
		res.render('event-detail');
	});

	/*
	  post the submit for the plan options
	*/
	app.post('/event/:eventId/:eventName',function(req,res) {

		//go through the options and add them to the current plan
		var options = {};

		//set the form data in the session so the angular app can read any errors
		req.session.eventOptionsForm = {
			payment:      req.param('payment'),
			parking:      req.param('parking') ? true : false,
			restaurant:   req.param('restaurant') ? true : false,
			hotel:        req.param('hotel') ? true : false,
			guestFriends: req.param('guest_friends') ? true : false,
			over21:       req.param('over_21') ? true : false,
			guestList:    req.param('guest_list'),
			errors:       {}
		};

		//payment option: either self or group
		if ((req.param('payment') === 'self') ||
			  (req.param('payment') === 'group')
			  ) {
			options.payment = req.param('payment');
		} else {
			req.session.eventOptionsForm.errors.payment = true;
		}

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
			res.render('partials/event-options',{
				eventId:req.param('eventId'),
				eventName:req.param('eventName')
			});
		} else {
			//move on to the next step
			//set a special header to tell angular to update the browser location
			res.setHeader('x-wembli-location','/invitation');
			res.render('partials/invitation',{partial:true});
		}

	});


}
