var ticketNetwork = require('../lib/wembli/ticketnetwork');

exports.event = {
    get: function(args,req,res) {
	console.log(args);
	var me = this;

	if (args.nearZip == "undefined") {
	    //get more top events
	    delete args.nearZip;
	}
	//ticketNetwork.GetEvents({beginDate:date,nearZip:zip,orderByClause:'Date'},function(err,results) {
	ticketNetwork.GetEvents(args,function(err,results) {
	    if (err) {
		return me(err);
	    }
	    
	    console.log(results);
	    me(null,{success:1,
		     event:results.Event});

	});
    },
    getTickets: function(args,req,res) {
	console.log(args);
	var me = this;

	ticketNetwork.GetEvents({eventID:args.eventID}, function(err,results) {
	    if (err) {
		return me(err);
	    }
	    var ret = {success:1,event:results.Event};
	    ticketNetwork.GetTickets(args,function(err,results) {
		if (err) {
		    return me(err);
		}
		ret.tickets = results.TicketGroup;
		console.log('ticketgroups:');
		console.log(results);
		me(null,ret);
	    });
	});
    },

};