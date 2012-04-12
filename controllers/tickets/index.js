var ticketNetwork = require('wembli/ticketnetwork');

require('date-utils');

module.exports = function(app) {
    app.all("/tickets",function(req,res) {
	if (typeof req.session.eventplan.event == "undefined") {
	    
	    //redirect to the home page and flash a message
	    req.flash('error','Your session has expired. If you sign up for Wembli, your work can be automatically saved.');
	    return res.redirect('/');
	}
	console.log('wts');
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

	var event = req.session.eventplan.event;
	ticketNetwork.GetTickets({eventID: event.ID},function(err,tickets) {
	    res.render('tickets', {
                session:req.session,
                tickets:tickets.TicketGroup?tickets.TicketGroup:[],
		event:event,
		title: 'wembli.com - tickets.',
		page:'tickets',
		globals:globalViewVars,
		cssIncludes: [],
                jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/tickets.js']
	    });
        });
    });

    app.all("/tickets/:guid",function(req,res) {
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


	var event = req.session.eventplan.event;
	ticketNetwork.GetTickets({eventID: event.ID},function(err,tickets) {
	    res.render('tickets', {
                session:req.session,
                tickets:tickets.TicketGroup?tickets.TicketGroup:[],
		event:event,
		title: 'wembli.com - tickets.',
		page:'tickets',
		globals:globalViewVars,
		cssIncludes: [],
                jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/tickets.js']
	    });
        });
    });
};