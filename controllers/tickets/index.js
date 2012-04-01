var ticketNetwork = require('wembli/ticketnetwork');

require('date-utils');

module.exports = function(app) {
    app.get("/tickets",function(req,res) {
	if (typeof req.session.eventplan.event == "undefined") {
	    //redirect to the home page and flash a message
	    req.flash('error','Your session has expired. If you sign up for Wembli, your work can be automatically saved.');
	    return res.redirect('/');
	}

	//if they are logged in save the plan
	if (req.session.loggedIn) {
	    req.session.customer.eventplan = [req.session.eventplan];
	    req.session.customer.save(function(err) {
		console.log('saved customer');
	    });
	}

	console.log(req.session.eventplan);
	var event = req.session.eventplan.event;
	console.log(event);
	ticketNetwork.GetTickets({eventID: event.ID},function(err,tickets) {
	    //console.log(tickets);
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