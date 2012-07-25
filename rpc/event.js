var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async = require('async');

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

	    var events = results.Event;
	    var cb = function() {
		console.log(events);
		me(null,{success:1,
			 event:events});
	    };
	    
	    async.forEach(events,function(item,callback) {
		//get the ticket pricing info for this event
		ticketNetwork.GetPricingInfo({eventID:item.ID},function(err,results) {
		    if (err) {
			callback(err);
		    } else {
			console.log(results);
			item.TicketPricingInfo = results;
			callback();
		    }
		});
	    },cb);
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