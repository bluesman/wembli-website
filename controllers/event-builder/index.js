var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var redis = require("redis"),
    redisClient = redis.createClient();
var uuid = require('node-uuid'); //this is for making a guid

var ticketNetwork = require('../../lib/wembli/ticketnetwork');

module.exports = function(app) {
    //set up the event plan for the first time
    app.all('/event/:eventId/:eventName',function(req,res) {
	console.log('called event builder');
	var eventId     = req.param('eventId');
	var eventName   = req.param('eventName');
	var services = {'friends':[],'tickets':{}};

	var wembliServices = globalViewVars.wembliServices;

	//for now, everytime they load this page, reset the req.session.currentPlan
	req.session.currentPlan = {};
	req.session.currentPlan.completed = {init:true};
	req.session.currentPlan.config = {};
	for (idx in wembliServices) {
	    var service = wembliServices[idx];
	    console.log('service for idx: '+idx);
	    console.log(service);
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
	req.session.isOrganizer = true;

	//this function determines which step to go to and goes there
	var dispatch = function(err,args) {
	    console.log(args.eventplan);
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
		console.log(venue);
		req.session.currentPlan.event.Venue = venue.Venue;
		//now continue to the right page
		dispatch(null,{eventplan:req.session.currentPlan});
	    });
	});
    });





/*
    app.all('/plan/view', function(req,res) {
	if (req.session.loggedIn) {	
	    return res.redirect('/plan/view/organizer/'+req.session.currentPlan.config.guid);
	} else {
	    return res.redirect('/plan/view/public/'+req.session.currentPlan.config.guid);
	}
    });

    app.all('/plan/view/organizer',function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	} else {
	    return res.redirect('/plan/view/organizer/'+req.session.currentPlan.config.guid);
	}
    });

    app.all('/plan/view/organizer/:guid',function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	}
	//get the event for this guid
	for (idx in req.session.customer.eventplan) {
	    var plan = req.session.customer.eventplan[idx];
	    if (plan.config.guid == req.param('guid')) {
		//hack for now - fix this
		req.session.currentPlan = plan;
		break;
	    }
	}

	if (typeof req.session.currentPlan == "undefined") {
	    req.flash('error','Unable to retrieve event. Please start a new plan.');
	    return res.redirect('/dashboard');
	}

	res.render('organizer-view', {
	    title: 'wembli.com - View Event Plan.',
	    layoutContainer: true,
	    page:'organizer',
	    cssIncludes: [],
            jsIncludes: ['/js/organizer-view.js']
	});

    });

    app.all('/plan/view/public/:guid',function(req,res) {
	res.render('public-view', {
	    event:req.session.currentPlan.event,
	    title: 'wembli.com - View Event Plan.',
	    page:'friends',
	    cssIncludes: [],
            jsIncludes: []
	});
    });
*/

/* i think this is no longer used - tomw 20120514
    app.all('/plan/view/friend/:action/:guid/:token',function(req,res) {
	//TODO: validate the action
	

	//get the customer/plan matching this guid
	var query = Customer.findOne({});
	query.where('eventplan').elemMatch(function (elem) {
	    elem.where('config.guid', req.param('guid'))
	});
	query.exec(function(err,organizer) {
	    console.log('found organizer for plan: '+req.param('guid'));
	    if (err) {
		console.log('error finding plan for: '+req.param('guid'));
		req.flash('error','We could not find the plan you were looking for.')
		return res.redirect("/");
	    }
	    //confirm that token is a valid token of a friend in this plan
	    var tokenMatch = false;
	    for (idx in organizer.eventplan) {
		var plan = organizer.eventplan[idx];
		console.log('checking plan: ');
		if (plan.config.guid == req.param('guid')) {
		    for (idx in plan.friends) {
			console.log('checking frined: '++ ' looking for token match');
			if ((typeof plan.friends[email].token != "undefined") && (plan.friends[email].token.token == req.param('token'))) {
			    console.log('found a token match');
			    plan.friends[email][req.param('action')].view = (typeof plan.friends[email][req.param('action')].view == "undefined") ? 1 : plan.friends[email][req.param('action')].view + 1;
			    plan.friends[email][req.param('action')].viewLastDate = new Date().format("m/d/yy h:MM TT Z");
			    req.session.friend = {};
			    req.session.friend.email = email;
			    req.session.friend.last_name = plan.friends[email].lastName;
			    req.session.friend.first_name = plan.friends[email].firstName;
			    req.session.friend.token = plan.friends[email].token;
			    break;
			}
		    }
		    if (typeof req.session.friend != "undefined") {
			req.session.organizer = organizer;
		    }
		    break;
		}
	    }

	    if (typeof req.session.friend != "undefined") {
		req.session.friend.eventplan = req.session.organizer.eventplan[0];
		console.log('tokens match, sending to friend view');
		console.log(req.session.friend);
		//save that they viewed for this action
		req.session.organizer.markModified('eventplan');
		req.session.organizer.save(function(err) {
		    console.log('saved organizer');
		    console.log('err: '+err);
		    res.render('friend-view', {
			layoutContainer:true,
			action:req.param('action'),
			event:req.session.friend.eventplan.event,
			title: 'wembli.com - View Event Plan.',
			page:'friends',
			cssIncludes: [],
			jsIncludes: ['/js/friend-view.js']
		    });
		});

	    } else {
		console.log('tokens do not match, sending to public view');
		return res.redirect("/plan/view/public/"+req.param('guid'));
	    }
	});


    });

    app.all('/summary',function(req,res) {

	if (typeof req.session.currentPlan.event =="undefined") {
	    //they tried to load summary without an event
	    //req.flash('error','Your session has expired. If you sign up for Wembli, your work can be automatically saved.');
	    return res.redirect('/');
	}

	if (req.param("completed")) {
	    console.log(req.param("completed"));
	    req.session.currentPlan.completed[req.param("completed")] = true;
	}

	//if they are logged in save the plan
	if (req.session.loggedIn) {
	    req.session.customer.eventplan = [req.session.currentPlan];
	    req.session.customer.markModified('eventplan');
	    req.session.customer.save(function(err) {
		console.log('saved customer');
	    });
	}


	res.render('summary', {
	    event:req.session.currentPlan.event,
	    title: 'wembli.com - Plan Summary.',
	    page:'summary',
	    cssIncludes: [],
            jsIncludes: ['','/js/summary.js']
	});
	
	
    });

    app.all('/summary/:guid',function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	}

	//get the event for this guid
	for (idx in req.session.customer.eventplan) {
	    var plan = req.session.customer.eventplan[idx];
	    if (plan.config.guid == req.param('guid')) {
		//hack for now - fix this
		req.session.currentPlan = plan;
		break;
	    }
	}

	if (typeof req.session.currentPlan == "undefined") {
	    req.flash('error','Unable to retrieve event. Please start a new plan.');
	    return res.redirect('/dashboard');
	}


	res.render('summary', {
	    event:req.session.currentPlan.event,
	    title: 'wembli.com - Plan Summary.',
	    page:'summary',
	    cssIncludes: [],
            jsIncludes: ['','/js/summary.js']
	});
	
	
    });
*/
    app.all('/event/save',function(req,res) {
	//saving plan
	req.session.customer.saveCurrentPlan(req.session.currentPlan,function(err) {
	    console.log('saved customer');
	    var redirectUrl = '/dashboard';
	    if (typeof req.param('redirectUrl') != "undefined") {
		//req.flash('info','Your work was saved.');
		redirectUrl = req.param('redirectUrl');
	    }
	    return res.redirect( redirectUrl );		    
	});
    });



}