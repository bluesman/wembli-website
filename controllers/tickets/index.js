var ticketNetwork = require('wembli/ticketnetwork');

require('date-utils');

module.exports = function(app) {
    app.get(/^\/tickets\/(\d+)\/(.*)$/,function(req,res) {
	console.log(req.session.eventplan);

	var eventId = req.params[0];
        ticketNetwork.GetEvents({eventID:eventId},function(err,event) {
	    ticketNetwork.GetTickets({eventID: eventId},function(err,tickets) {
		//console.log(tickets);
		res.render('tickets', {
		    layout:'layout-full-width',
                    session:req.session,
                    tickets:tickets.TicketGroup,
		    event:event.Event,
		    title: 'wembli.com - tickets.',
		    page:'foo',
		    globals:globalViewVars,
		    cssIncludes: [],
                    jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/twitter-bootstrap/bootstrap-modal.js','/js/twitter-bootstrap/bootstrap-transition.js','/js/tickets.js']
		});
	    });
        });
    });
};