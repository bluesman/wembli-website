var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var redis = require("redis"),
    redisClient = redis.createClient();

var ticketNetwork = require('../lib/wembli/ticketnetwork');

var Db = require('mongodb').Db,
Connection = require('mongodb').Connection,
Server = require('mongodb').Server;


//return result back to client after updating the cache
var _respond = function(error,data,req,me) {
    if (error) {
	console.log('error: '+ error);
	me(error,{success:0});
    } else {
	//TODO: save data for customer if logged in
	if (req.session.loggedIn) {
	    req.session.customer.eventplan = [data];
	    req.session.customer.markModified('eventplan');
	    req.session.customer.save(function(err) {

	    });
	}


	me(null,{success:1,
		 eventplan:data});
    }
};

var _initEventplan = function(req,callback) {
    if (req.session.loggedIn) {
	if (typeof req.session.customer == 'string') {
	    req.session.customer = JSON.parse(req.session.customer);
	}
	//refresh customer from the db
	Customer.findOne({email:req.session.customer.email},function(err,customer) {
	    if (err != null || customer == null) {
		//console.log('error finding customer for session!: '+err);
		delete req.session.customer;
		req.session.loggedIn = false;
		return callback('Authentication error');		
	    }
	    req.session.customer = customer;
	    //make sure we have an event plan
	    if (typeof req.session.eventplan == "undefined") {
		return callback('no eventplan available');
	    }
	    var e = (typeof req.session.eventplan != "undefined") ? req.session.eventplan : {};
	    return callback(null,e);
	});
    } else {
	//make sure we have an event plan
	if (typeof req.session.eventplan == "undefined") {
	    return callback('no eventplan available');
	}
	var e = (typeof req.session.eventplan != "undefined") ? req.session.eventplan : {};
	return callback(null,e);
    }
};

/* req and res can always be the last 2 args */
exports.eventplan = {
    getFriendEventPlan: function(req,res) {
	var me = this;
	if ((typeof req.session.friend == "undefined") || (typeof req.session.friend.eventplan == "undefined")) {
	    return _response('no eventplan available');
	}
	
	return _respond(null,req.session.friend.eventplan,req,me);
    },

    getEventPlan: function(req,res) {
	var me = this;
	_initEventplan(req,function(err,e) {
	    if (err) { return _respond(err,null,null,me); }
	    return _respond(null,e,req,me);
	});
    },

    removeFriend: function(friendId,req,res) {
	var me = this;

	_initEventplan(req,function(err,e) {
	    if (err) { return _respond(err,null,null,me); }

	    //deserialize?
	    if (typeof e.friends !== "undefined") {
		delete e.friends[friendId];
	    }

	    return _respond(err,e,req,me);
	});
    },


    addFriends: function(friends,req,res) {
	var me = this;

	_initEventplan(req,function(err,e) {
	    if (err) { return _respond(err,null,null,me); }

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
	    
	    return _respond(err,e,req,me);
	});
    },



    addTicketGroup: function(ticketId,req,res) {
	var me = this;

	_initEventplan(req,function(err,e) {
	    if (err) { return _respond(err,null,null,me); }

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
		
		return _respond(err,e,req,me);
	    };

	    //get ticketnetwork data for this ticket
	    ticketNetwork.GetTickets({ticketGroupID: ticketId},mapTixData);
	});
    },

    removeTicketGroup: function(ticketId,req,res) {
	var me = this;

	_initEventplan(req,function(err,e) {
	    if (err) { return _respond(err,null,null,me); }

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
	    return _respond(err,e,req,me);
	});
    },

    rsvp: function(rsvp,req,res) {
	var me = this;

	//must have a req.session.friend
	if (typeof req.session.friend == "undefined") {
	    return _respond('Authentication error');
	}

	//signify that this person will be attending by setting decision in the eventplan
	var email = req.session.friend.email;
	//fetch the updated event
	var query = Customer.findOne({});
	query.where('eventplan').elemMatch(function (elem) {
	    elem.where('config.guid', req.session.friend.eventplan.config.guid)
	});
	query.exec(function(err,organizer) {
	    organizer.eventplan[0].friends[email].decision = (rsvp == "YES") ? true : false;
	    organizer.markModified('eventplan');
	    organizer.save(function(err) {
		req.session.friend.eventplan = organizer.eventplan[0];
		req.session.organizer = organizer;
		return _respond(err,organizer,req,me);
	    });
	});
    }
}