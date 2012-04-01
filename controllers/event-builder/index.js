var redis = require("redis"),
    redisClient = redis.createClient();

var ticketNetwork = require('../../lib/wembli/ticketnetwork');

module.exports = function(app) {
    app.all('/event/:eventId/:eventName',function(req,res) {
	console.log('called event builder');
	var eventId     = req.param('eventId');
	var eventName   = req.param('eventName');
	var guid        = req.session.eventplanGuid;
	var wembliServices = globalViewVars.wembliServices;

	//for now, everytime they load this page, reset the req.session.eventplan
	req.session.eventplan = {};
	req.session.eventplan.completed = {};
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
	req.session.eventplan.config['payment'] = (typeof req.body['payment'] == "undefined") ? 'group' : req.body['payment'];
	req.session.eventplan.config['guid'] = guid;

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
	    
	    var saveEventplan = {};
	    for (key in req.session.eventplan) {
		saveEventplan[key] = JSON.stringify(req.session.eventplan[key]);
	    }

	    //serialize and store in redis
	    redisClient.hmset('eventplan:'+guid,saveEventplan,
			      function(hmsetErr,hmsetResponse) {
				  console.log('set eventplan in redis');
				  //now continue to the right page
				  dispatch(null,{eventplan:req.session.eventplan});
			      });
	});
    });

    app.all('/event/summary',function(req,res) {
	var guid           = req.session.eventplanGuid;
	var wembliServices = globalViewVars.wembliServices;
	if (typeof req.session.eventplan.event =="undefined") {
	    //they tried to load summary without an event
	    req.flash('error','Your session has expired. If you sign up for Wembli, your work can be automatically saved.');
	    return res.redirect('/');
	}

	res.render('summary', {
	    event:req.session.eventplan.event,
	    title: 'wembli.com - Plan Summary.',
	    page:'summary',
	    cssIncludes: [],
            jsIncludes: ['/js/summary.js']
	});
	
	
    });

    app.all('/event/save',function(req,res) {
	//saving plan
	req.session.customer.eventplan = [req.session.eventplan];
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