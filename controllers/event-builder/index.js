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

	//if there's no eventplan.completed, init it
	if (typeof req.session.eventplan.completed == "undefined") {
	    req.session.eventplan.completed = {};
	}

	//if there's no config or they are coming from the options overlay, set the config
	if ((typeof req.session.eventplan.config == "undefined") || (typeof req.body.setConfig != "undefined")) {
	    console.log('setting config');
	    req.session.eventplan.config = {};
	    for (idx in wembliServices) {
		var service = wembliServices[idx];
		req.session.eventplan.config[service] = (typeof req.body[service] == "undefined") ? false : true;
	    }
	}

	console.log('called event builder for eventId: '+eventId);

	//this function determines which step to go to and goes there
	var dispatch = function(err,args) {
	    console.log(args.eventplan.config);
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

	//if there's no event then we're basically creating a brand new eventplan
	if ((typeof req.session.eventplan.event == "undefined") || (req.session.eventplan.event.ID != eventId)) {
	    //get the event for this eventId
	    ticketNetwork.GetEvents({eventID:eventId},function(err,event) {
		if (err) {
		    //send to home page for now
		    //TODO: make an event builder error page
		    return res.redirect('/');
		}

		//add event to the event plan
		req.session.eventplan.event = event.Event;

		//serialize and store in redis
		var serializedConfig = JSON.stringify(req.session.eventplan.config);
		var serializedEvent = JSON.stringify(event.Event);
		redisClient.hmset('eventplan:'+guid,
				  {config:JSON.stringify(req.session.eventplan.config),
				   completed: JSON.stringify(req.session.eventplan.completed),
				   event: JSON.stringify(event.Event)},
				  function(hmsetErr,hmsetResponse) {
				      console.log('set eventplan in redis');
				      //now continue to the right page
				      dispatch(null,{eventplan:req.session.eventplan});
				  });
	    });
	} else {
	    dispatch(null,{eventplan:req.session.eventplan});
	}
    });
}