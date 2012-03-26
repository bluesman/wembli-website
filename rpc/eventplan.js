var redis = require("redis"),
    redisClient = redis.createClient();

var ticketNetwork = require('../lib/wembli/ticketnetwork');

//return result back to client after updating the cache
var _respond = function(error,data,me) {
    if (error) {
	console.log(error);
	me(error,{success:0});
    } else {
	me(null,{success:1,
		 eventplan:data});
    }
};


exports.eventplan = {
    getEventPlan: function(guid) {
	var me = this;
	var error = null;
	redisClient.hgetall('eventplan:'+guid,function(err,cache) {
	    var eventplan = {};
	    eventplan[guid] = cache;
	    _respond(err,eventplan,me);
	});
	
    },
    removeFriend: function(guid,args) {
	var me = this;
	var error = null;

	//remove the tickets from the event plan and update the cache and respond to client
	var removeFriendFromEvent = function(err,eventplan) {
	    var friends = (typeof eventplan.friends !== "undefined") ? JSON.parse(eventplan.friends) : {};
	    delete friends[args.friendId];

	    //store the updated tix list
	    eventplan.friends = JSON.stringify(friends);

	    //set the updated data
	    redisClient.hmset('eventplan:'+guid,eventplan,function(hmsetErr,hmsetResponse) {
		//TODO:  error checking
		var responseData = {}
		responseData[guid] = eventplan;
		_respond(error,responseData,me);
	    });

	};

	redisClient.hgetall('eventplan:'+guid,removeFriendFromEvent);
    },


    addFriends: function(guid, args) {
	var me = this;
	var error = null;

	if (typeof args.friends == "undefined") {
	    return _respond('no friends provided',null,me);
	}

	var addFriendsToEvent = function(err,eventplan) {


	    var friends = (typeof eventplan.friends !== "undefined") ? JSON.parse(eventplan.friends) : {};
	    //friends is a hash keyed by email address
	    for (email in args.friends) {
		friends[email] = args.friends[email];
	    }

	    //store the updated tix list
	    eventplan.friends = JSON.stringify(friends);

	    //set the updated data
	    redisClient.hmset('eventplan:'+guid,eventplan,function(hmsetErr,hmsetResponse) {
		//TODO:  error checking
		var responseData = {}
		responseData[guid] = eventplan;
		_respond(error,responseData,me);
	    });


	};
	
	redisClient.hgetall('eventplan:'+guid,addFriendsToEvent);
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
		    _respond(error,responseData,me);
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
		_respond(error,responseData,me);
	    });

	};

	redisClient.hgetall('eventplan:'+guid,removeTix);


    }


}