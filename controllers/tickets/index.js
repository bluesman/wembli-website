var ticketNetwork = require('wembli/ticketnetwork');

require('date-utils');

module.exports = function(app) {
    app.get(/^\/tickets\/(\d+)\/(.*)$/,function(req,res) {
	console.log(req.session.eventplan);

	var eventId = req.params[0];
        ticketNetwork.GetEvents({eventID:eventId},function(err,event) {
	    ticketNetwork.GetTickets({eventID: eventId},function(err,tickets) {

		res.render('tickets', {
                    session:req.session,
                    tickets:tickets.TicketGroup?tickets.ticketGroup:[],
		    event:event.Event,
		    title: 'wembli.com - tickets.',
		    page:'foo',
		    globals:globalViewVars,
		    cssIncludes: [],
                    jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/tickets.js']
		});
	    });
        });
    });
};