var redis = require("redis"),
    redisClient = redis.createClient();

var ticketNetwork = require('../lib/wembli/ticketnetwork');

exports.eventplan = {
    getEventPlan: function(guid) {
	var me = this;
	var error = null;
	redisClient.hgetall('eventplan:'+guid,function(err,cache) {
	    if (err) {
		me(err);
	    } else {
		var eventplan = {};
		eventplan[guid] = cache;
		me(null,{success:1,
			 eventplan:eventplan});
	    }
	});
	
    },

    addTicketGroup: function(guid,args) {
	var me = this;
	var error = null;

	/* the structure of the cache is like this:

	   eventplan:<someguid> = {
	                           event: eventData,
	                           tickets: {123456: { ticketnetwork.TicketGroup },
				             123457: { ... },
					     123458: { ... }
					     },
				   friends: { ... },
				   parking: { ... },
				   };

	 */


	//return result back to client after updating the cache
	var respond = function(error,data) {
	    if (error) {
		me(error);
	    } else {
		me(null,{success:1,
		     eventplan:data});
	    }
	};

	//get the tix data matching the passed in id
	var mapTixData = function(err,ticketData) {
	    //var ticketGroup = JSON.stringify(ticketData.TicketGroup);
	    var ticketGroup = ticketData.TicketGroup;
	    //add the tickets to the event plan and update the cache and respond to client
	    var addTix = function(err,cache) {
		var tickets = (typeof cache.tickets !== "undefined") ? JSON.parse(cache.tickets) : {};
		//make sure this ticket group is not already in the cache, if it is - wack the old and replace with the new
		var replaced = false;
		for (var cachedTixId in tickets) {
		    if (cachedTixId == args.ticketId) {
			tickets[cachedTixId] = ticketGroup;
			replaced = true;
		    }
		}
		//if i didn't replace an existing then i just have to push this group in
		if (!replaced) {
		    tickets[args.ticketId] = ticketGroup;
		}
		//stored the updated tix list
		cache.tickets = JSON.stringify(tickets);

		//fail if no guid

		redisClient.hmset('eventplan:'+guid,cache,function(hmsetErr,hmsetResponse) {
		    //TODO:  error checking
		    var responseData = {}
		    responseData[guid] = cache;
		    respond(error,responseData);
		});

	    };

	    //returns err,cache - cache is key.value = <serialized json>
	    redisClient.hgetall('eventplan:'+guid,addTix);
	};


	//get ticketnetwork data for this ticket
	ticketNetwork.GetTickets({ticketGroupID: args.ticketId},mapTixData);

    },

    removeTicketGroup: function(guid,args) {
	var me = this;
	var error = null;

	//return result back to client after updating the cache
	var respond = function(error,data) {
	    if (error) {
		me(error);
	    } else {
		me(null,{success:1,
		     eventplan:data});
	    }
	};

	//remove the tickets from the event plan and update the cache and respond to client
	var removeTix = function(err,cache) {
	    var tickets = (typeof cache.tickets !== "undefined") ? JSON.parse(cache.tickets) : {};
	    delete tickets[args.ticketId];

	    //store the updated tix list
	    cache.tickets = JSON.stringify(tickets);

	    //set the updated data
	    redisClient.hmset('eventplan:'+guid,cache,function(hmsetErr,hmsetResponse) {
		//TODO:  error checking
		var responseData = {}
		responseData[guid] = cache;
		respond(error,responseData);
	    });

	};

	redisClient.hgetall('eventplan:'+guid,removeTix);


    }


}