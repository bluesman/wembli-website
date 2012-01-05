var ticketNetwork = require('wembli/ticketnetwork');

require('date-utils');

module.exports = function(app) {
    app.get(/^\/tickets\/(\d+)\/(.*)$/,function(req,res) {
	var eventId = req.params[0];
	console.log(eventId);
        ticketNetwork.GetEvents({eventID:eventId},function(err,event) {
	    //console.log(event);                                                                                                                        
	    ticketNetwork.GetTickets({eventID: eventId},function(err,tickets) {
		//console.log(err);
		//console.log(tickets);
		res.render('tickets', {
                    session:req.session,
                    tickets:tickets.TicketGroup,
		    event:event.Event,
		    title: 'wembli.com - tickets.',
		    page:'foo',
		    globals:globalViewVars,
		    cssIncludes: [],
                    jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js']
		});
	    });
        });
    });
};