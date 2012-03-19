var ticketNetwork = require('wembli/ticketnetwork');

require('date-utils');

module.exports = function(app) {
    app.get("/tickets",function(req,res) {
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