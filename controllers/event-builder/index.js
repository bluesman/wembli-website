var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Feed     = wembliModel.load('feed');
var redis = require("redis"),
    redisClient = redis.createClient();
var uuid = require('node-uuid'); //this is for making a guid

var ticketNetwork = require('../../lib/wembli/ticketnetwork');

module.exports = function(app) {
    app.get('/event/:eventId/:eventName',function(req,res) {
	var eventId     = req.param('eventId');
	var eventName   = req.param('eventName');
	console.log('hey');
	ticketNetwork.GetEvents({eventID:eventId},function(err,event) {
	    if (err) {
		//send to home page for now
		//TODO: make an event builder error page
		return res.redirect('/');
	    }

	    //add event to the event plan
	    var e = event.Event;
	    
	    //get the venue
	    console.log('event-builder: event:');
	    console.log(event);
	    if ((typeof event.Event != "undefined") && (typeof event.Event.VenueID != "undefined")) {
		ticketNetwork.GetVenue({VenueID:event.Event.VenueID},function(err,venue) {
		    e.Venue = venue.Venue;
		    //now continue to the right page
		    res.render('event-view', {
			title: 'wembli.com - View Event Plan.',
			layoutContainer: true,
			page:'event',
			cssIncludes: [],
			jsIncludes: [],
			event:e
		    });
		});
	    } else {
		res.redirect('/');
	    }
	});
	
    });
    //set up the event plan for the first time
    app.post('/event/:eventId/:eventName',function(req,res) {
	console.log('called event builder for url: '+req.url);
	var eventId     = req.param('eventId');
	var eventName   = req.param('eventName');

	var services = {'friends':[],'tickets':{}};

	var wembliServices = globalViewVars.wembliServices;

	if (req.param('updateEvent') && req.session.currentPlan && req.session.currentPlan.config) {
	    console.log('updating event for current plan')
	} else {

	    //for now, everytime they load this page, reset the req.session.currentPlan
	    req.session.currentPlan = {};
	    req.session.currentPlan.completed = {init:true};
	    req.session.currentPlan.config = {};
	    for (idx in wembliServices) {
		var service = wembliServices[idx];
		console.log('service for idx: '+idx);
		if (typeof services[service] == "undefined") {
		    req.session.currentPlan.config[service] = false;
		    if (typeof req.session.currentPlan[service] != "undefined") {
			delete req.session.currentPlan[service];
		    }
		} else {
		    req.session.currentPlan.config[service] = true;
		    req.session.currentPlan[service] = services[service];
		}
	    }
	    req.session.currentPlan.config['summary'] = true; //every plan has a summary
	    req.session.currentPlan.config['payment'] = (typeof req.body['payment'] == "undefined") ? 'group' : req.body['payment'];
	    req.session.currentPlan.config['guid']    = uuid.v1();


	    //queue up feed activity to be saved when this person saves their work
	    var action = {name:'initPlan'};
	    var meta = {};
	    var activity = {action:action,
			    meta:meta,
			    time:Date.now()
			   };
	    
	    console.log('added initPlan feed activity');
	    req.session.currentPlan.feed = [];
	    req.session.currentPlan.feed.push(activity);
	}

	req.session.isOrganizer = true;

	//this function determines which step to go to and goes there
	var dispatch = function(err,args) {
	    //check eventplan to see which step should go next
	    var goto = 'tickets';
	    for (idx in wembliServices) {
		var service = wembliServices[idx];
		console.log('checking if '+service+' is complete');
		if (args.eventplan.config[service] && (typeof args.eventplan.completed[service] == "undefined")) {
		    //do the step
		    goto = service;
		    break;
		}
	    }
	    console.log('redirecting to: '+goto);
	    res.redirect('/plan/'+goto);
	};
	  
	//get the event for this eventId
	ticketNetwork.GetEvents({eventID:eventId},function(err,event) {
	    if (err) {
		//send to home page for now
		//TODO: make an event builder error page
		return res.redirect('/');
	    }

	    //add event to the event plan
	    req.session.currentPlan.event = event.Event;
	    
	    //get the venue
	    ticketNetwork.GetVenue({VenueID:event.Event.VenueID},function(err,venue) {
		req.session.currentPlan.event.Venue = venue.Venue;
		//now continue to the right page
		dispatch(null,{eventplan:req.session.currentPlan});
	    });
	});
    });

    app.all('/event/save',function(req,res) {
	console.log('calling event save');
	//log this event
	var actor = {name:req.session.customer.first_name+' '+req.session.customer.last_name,
		     keyName:'organizer',
		     keyValue:'organizer'};
	var action = {name:'initPlan'};
	var meta = {};
	var activity = {action:action,
			actor:actor,
			meta:meta};


	var redir = function() {
	    var redirectUrl = '/dashboard';
	    if (typeof req.param('redirectUrl') != "undefined") {
		//req.flash('info','Your work was saved.');
		redirectUrl = req.param('redirectUrl');
	    }
	    return res.redirect( redirectUrl );		    
	}
	if (req.session.customer && !req.session.currentPlan.config.organizer) {
	    console.log('setting organizer for plan to '+req.session.customer.email);
	    req.session.currentPlan.config.organizer = req.session.customer.email;
	}

	req.session.customer.saveCurrentPlan(req.session.currentPlan,function(err) {
	    console.log('saved current plan');
	    return redir();
	});
	
    });



}