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

	var wembliServices = globalViewVars.wembliServices;

	//for now, everytime they load this page, reset the req.session.eventplan
	req.session.eventplan = {};
	req.session.eventplan.completed = {init:true};
	req.session.eventplan.config = {};
	for (idx in wembliServices) {
	    var service = wembliServices[idx];
	    if (typeof req.body[service] == "undefined") {
		req.session.eventplan.config[service] = false;
		if (typeof req.session.eventplan[service] != "undefined") {
		    delete req.session.eventplan[service];
		}
	    } else {
		req.session.eventplan.config[service] = true;
		req.session.eventplan[service] = {};
	    }
	}
	req.session.eventplan.config['summary'] = true; //every plan has a summary
	req.session.eventplan.config['payment'] = (typeof req.body['payment'] == "undefined") ? 'group' : req.body['payment'];
	req.session.eventplan.config['guid']    = uuid.v1();

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
	    res.redirect('/'+goto);
	};

	//get the event for this eventId
	ticketNetwork.GetEvents({eventID:eventId},function(err,event) {
	    if (err) {
		//send to home page for now
		//TODO: make an event builder error page
		return res.redirect('/');
	    }

	    //add event to the event plan
	    req.session.eventplan.event = event.Event;
	    
	    //now continue to the right page
	    dispatch(null,{eventplan:req.session.eventplan});
	});
    });

    app.all('/plan/view/organizer',function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	} else {
	    return res.redirect('/plan/view/organizer/'+req.session.eventplan.config.guid);
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
		req.session.eventplan = plan;
		break;
	    }
	}

	if (typeof req.session.eventplan == "undefined") {
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

    app.all('/plan/view/friend',function(req,res) {
	res.render('friend-view', {
	    event:req.session.eventplan.event,
	    title: 'wembli.com - View Event Plan.',
	    page:'friends',
	    cssIncludes: [],
            jsIncludes: []
	});

    });

    app.all('/summary',function(req,res) {
	var wembliServices = globalViewVars.wembliServices;
	if (typeof req.session.eventplan.event =="undefined") {
	    //they tried to load summary without an event
	    req.flash('error','Your session has expired. If you sign up for Wembli, your work can be automatically saved.');
	    return res.redirect('/');
	}

	if (req.param("completed")) {
	    console.log(req.param("completed"));
	    req.session.eventplan.completed[req.param("completed")] = true;
	}

	//if they are logged in save the plan
	if (req.session.loggedIn) {
	    req.session.customer.eventplan = [req.session.eventplan];
	    req.session.customer.markModified('eventplan');
	    req.session.customer.save(function(err) {
		console.log('saved customer');
	    });
	}


	res.render('summary', {
	    event:req.session.eventplan.event,
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
		req.session.eventplan = plan;
		break;
	    }
	}

	if (typeof req.session.eventplan == "undefined") {
	    req.flash('error','Unable to retrieve event. Please start a new plan.');
	    return res.redirect('/dashboard');
	}


	res.render('summary', {
	    event:req.session.eventplan.event,
	    title: 'wembli.com - Plan Summary.',
	    page:'summary',
	    cssIncludes: [],
            jsIncludes: ['','/js/summary.js']
	});
	
	
    });

    app.all('/event/save',function(req,res) {
	//saving plan
	req.session.customer.eventplan = [req.session.eventplan];
	req.session.customer.markModified('eventplan');
	req.session.customer.save(function(err) {
	    console.log('saved customer');
	    var redirectUrl = '/dashboard';
	    if (typeof req.param('redirectUrl') != "undefined") {
		req.flash('info','Your work was saved.');
		redirectUrl = req.param('redirectUrl');
	    }
	    return res.redirect( redirectUrl );		    
	});
    });



}