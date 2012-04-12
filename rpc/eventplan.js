var redis = require("redis"),
    redisClient = redis.createClient();

var ticketNetwork = require('../lib/wembli/ticketnetwork');

//return result back to client after updating the cache
var _respond = function(error,data,me) {
    if (error) {
	console.log(error);
	me(error,{success:0});
    } else {
	//TODO: save data for customer if logged in

	me(null,{success:1,
		 eventplan:data});
    }
};

var _initEventplan = function(req) {

    //make sure we have an event plan
    if (typeof req.session.eventplan == "undefined") {
	return _respond('no eventplan available');
    }
    return req.session.eventplan;
};

/* req and res can always be the last 2 args */
exports.eventplan = {
    getEventPlan: function(req,res) {
	var me = this;

	var e = (typeof req.session.eventplan != "undefined") ? req.session.eventplan : {};

	_respond(null,e,me);
    },

    removeFriend: function(friendId,req,res) {
	var me = this;
	var error = null;

	var e = _initEventplan(req);

	//deserialize?
	if (typeof e.friends !== "undefined") {
	    delete e.friends[friendId];
	}
	//TODO: save customer if logged in

	_respond(error,e,me);
    },


    addFriends: function(friends,req,res) {
	var me = this;
	var error = null;

	var e = _initEventplan(req);

	if (typeof friends == "undefined") {
	    return _respond('no friends provided',null,me);
	}

	if (typeof e.friends == "undefined") {
	    e.friends = {};
	}

	//friends is a hash keyed by email address
	for (email in friends) {
	    e.friends[email] = friends[email];
	}

	_respond(error,e,me);
    },



    addTicketGroup: function(ticketId,req,res) {
	var me = this;
	var error = null;
	var e = _initEventplan(req);

	if (typeof ticketId == "undefined") {
	    return _respond('no ticketId provided',null,me);
	}

	if (typeof e.tickets == "undefined") {
	    e.tickets = {};
	}

	//get the tix data matching the passed in id
	var mapTixData = function(err,ticketData) {
	    //var ticketGroup = JSON.stringify(ticketData.TicketGroup);
	    var ticketGroup = ticketData.TicketGroup;
	    //add the tickets to the event plan and respond to client
	    //make sure this ticket group is not already in the cache, if it is - wack the old and replace with the new
	    var replaced = false;
	    for (var existingTixId in e.tickets) {
		if (existingTixId == ticketId) {
		    e.tickets[existingTixId] = ticketGroup;
		    replaced = true;
		    break;
		}
	    }
	    //if i didn't replace an existing then i just have to push this group in
	    if (!replaced) {
		e.tickets[ticketId] = ticketGroup;
	    }
	
	    _respond(error,e,me);
	};

	//get ticketnetwork data for this ticket
	ticketNetwork.GetTickets({ticketGroupID: ticketId},mapTixData);
    },

    removeTicketGroup: function(ticketId,req,res) {
	var me = this;
	var error = null;
	var e = _initEventplan(req);

	if (typeof ticketId == "undefined") {
	    return _respond('no ticketId provided',null,me);
	}

	if (typeof e.tickets == "undefined") {
	    e.tickets = {};
	}

	//remove the tickets from the eventplan and respond to client
	if (typeof e.tickets[ticketId] != "undefined") {
	    delete e.tickets[ticketId];
	}
	_respond(error,e,me);
    }
}