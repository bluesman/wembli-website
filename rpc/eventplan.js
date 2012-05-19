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
	console.log('do i save?');
	if (req.session.loggedIn && req.session.isOrganizer) {
	    console.log('yes!');
	    console.log(data);
	    req.session.customer.saveCurrentPlan(data);
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
	    if (typeof req.session.currentPlan == "undefined") {
		return callback('no eventplan available');
	    }
	    var e = (typeof req.session.currentPlan != "undefined") ? req.session.currentPlan : {};
	    return callback(null,e);
	});
    } else {
	//make sure we have an event plan
	if (typeof req.session.currentPlan == "undefined") {
	    return callback('no eventplan available');
	}
	var e = (typeof req.session.currentPlan != "undefined") ? req.session.currentPlan : {};
	return callback(null,e);
    }
};

/* req and res can always be the last 2 args */
exports.eventplan = {
    getCurrentPlan: function(req,res) {
	var me = this;
	_initEventplan(req,function(err,e) {
	    if (err) { return _respond(err,null,null,me); }
	    return _respond(null,e,req,me);
	});
    },

    removePlan: function(guid,req,res) {
	var me = this;
	//make sure this plan belongs to this customer, if so, mark it as removed in config
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
		var good = false;
		for (idx in customer.eventplan) {
		    if (typeof customer.eventplan[idx].config == "undefined") {
			continue;
		    }
		    console.log('eventplan #'+idx);
		    console.log('comparing: '+customer.eventplan[idx].config.guid+' to '+guid);
		    if (customer.eventplan[idx].config.guid == guid) {
			good = true;
			console.log('match');
			customer.eventplan[idx].config.deleted = true;
			customer.markModified('eventplan');
			customer.save(function(err) {
			    if (err) { return _respond(err,null,null,me); }
			    var plan = customer.eventplan[idx];
			    console.log(plan);
			    return _respond(null,customer.eventplan[idx],req,me);
			});
		    }
		}

		if (!good) {
		    //if we got here something went wrong, we did not find the plan to delete
		    return _respond('invalid eventplan guid: '+guid,null,null,me);
		}

	    });
	} else {
	    //make sure we have an event plan
	    if (typeof req.session.currentPlan == "undefined") {
		return callback('no eventplan available');
	    }
	}
	
    },

    removeFriend: function(friendId,req,res) {
	var me = this;

	_initEventplan(req,function(err,e) {
	    if (err) { return _respond(err,null,null,me); }

	    //deserialize?
	    var newFriends = [];
	    if (typeof e.friends !== "undefined") {
		for (var idx in e.friends) {
		    var id = ((typeof e.friends[idx].addMethod != "undefined") && (e.friends[idx].addMethod == "facebook")) ? e.friends[idx].fbId : e.friends[idx].email;
		    console.log('comparing: '+friendId+' to '+id);
		    if (id != friendId) {
			newFriends.push(e.friends[idx]);
		    }
		}
	    }
	    e.friends = newFriends;

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
		e.friends = [];
	    }

	    //friends is a hash keyed by email address
	    for (var idx in friends) {
		if (typeof e.friendIds == "undefined") {
		    e.friendIds = [];
		}
		var id = ((typeof friends[idx].addMethod != "undefined") && (friends[idx].addMethod == "facebook")) ? friends[idx].fbId : friends[idx].email;
		e.friendIds.push(id);
		e.friends.push(friends[idx]);
	    }
	    
	    return _respond(err,e,req,me);
	});
    },



    addTicketGroup: function(ticketId,qty,req,res) {
	var me = this;
	_initEventplan(req,function(err,e) {
	    if (err) { return _respond(err,null,null,me); }

	    if ((typeof qty == "undefined") || (parseInt(qty) < 1)) {
		return _respond('no qty provided',null,me);
	    }
	    
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
		ticketGroup.selectedQty = qty;
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
	var handleOrganizer = function(err,organizer) {
	    var friendId = ((typeof req.session.friend.addMethod != "undefined") && (req.session.friend.addMethod == "facebook")) ? req.session.friend.fbId : req.session.friend.email;
	    //get the plan that matches and save it
	    for (var idx in organizer.eventplan) {
		if (organizer.eventplan[idx].config.guid == req.session.currentPlan.config.guid) {
		    for (var idx2 in organizer.eventplan[idx].friends) {
			var friendId2 = ((typeof organizer.eventplan[idx].friends[idx2].addMethod != "undefined") && (organizer.eventplan[idx].friends[idx2].addMethod == "facebook")) ? organizer.eventplan[idx].friends[idx2].fbId : organizer.eventplan[idx].friends[idx2].email;
			if (friendId == friendId2) {
			    organizer.eventplan[idx].friends[idx2].decision = (rsvp == "YES") ? true : false;
			}
		    }
		    req.session.currentPlan = organizer.eventplan[idx];
		    req.session.organizer = organizer;
		    req.session.organizer.saveCurrentPlan(req.session.currentPlan);
		    return _respond(err,req.session.currentPlan,req,me);
		}
	    }
	};

	//fetch the updated event
	Customer.findPlanByGuid(req.session.currentPlan.config.guid,handleOrganizer);

    },
    vote: function(voteType,voteId,req,res) {
	var me = this;

	//must have a req.session.friend
	if (typeof req.session.friend == "undefined") {
	    return _respond('Authentication error');
	}

	//increment voteCnt for this ticket id

	var handleOrganizer = function(err,organizer) {
	    var friendId = ((typeof req.session.friend.addMethod != "undefined") && (req.session.friend.addMethod == "facebook")) ? req.session.friend.fbId : req.session.friend.email;
	    //get the plan that matches and save it
	    for (var idx in organizer.eventplan) {
		if (organizer.eventplan[idx].config.guid == req.session.currentPlan.config.guid) {
		    for (idx2 in organizer.eventplan[idx].friends) {
			var friendId2 = ((typeof organizer.eventplan[idx].friends[idx2].addMethod != "undefined") && (organizer.eventplan[idx].friends[idx2].addMethod == "facebook")) ? organizer.eventplan[idx].friends[idx2].fbId : organizer.eventplan[idx].friends[idx2].email;
			if (friendId == friendId2) {
			    if (typeof organizer.eventplan[idx].friends[idx2].votes == "undefined") {
				organizer.eventplan[idx].friends[idx2].votes = {};
			    }
			    //save the vote in the friend
			    organizer.eventplan[idx].friends[idx2].votes[voteType] = voteId;
			    //recalculate voteCnt and votePct
			}
		    }

		    var tally = {};
		    for (var idx3 in organizer.eventplan[idx].friends) {
			for(var k in organizer.eventplan[idx].friends[idx3].votes) {
			    if (typeof tally[k] == "undefined") {
				tally[k] = {};
			    }
			    if (typeof tally[k][organizer.eventplan[idx].friends[idx3].votes[k]] == "undefined") {
				tally[k][organizer.eventplan[idx].friends[idx3].votes[k]] = 1;
			    } else {
				tally[k][organizer.eventplan[idx].friends[idx3].votes[k]]++;
			    }
			    
			    if (typeof tally[k]['total'] == "undefined") {
				tally[k]['total'] = 1;
			    } else {
				tally[k]['total']++;				
			    }
			}
		    }

		    //clear out any existing votes for things we can vote on
		    for (serviceIdx in globalViewVars.wembliServices) {
			var service = globalViewVars.wembliServices[serviceIdx];
			if (typeof organizer.eventplan[idx][service] != "undefined") {
			    for (serviceKey in organizer.eventplan[idx][service]) {
				if (typeof organizer.eventplan[idx][service][serviceKey].voteCnt != "undefined") {
				    organizer.eventplan[idx][service][serviceKey].voteCnt = 0;
				}
				if (typeof organizer.eventplan[idx][service][serviceKey].votePct != "undefined") {
				    organizer.eventplan[idx][service][serviceKey].votePct = 0;
				}
			    }
			}
		    }

		    //set voteCnt and votePct using the tally
		    for (var vt in tally) {

			for (var id in tally[vt]) {
			    if (id == 'total') {
				continue;
			    }
			    organizer.eventplan[idx][vt][id].voteCnt = tally[vt][id];
			    //vote percentage is the votes for this id divided by total votes cast
			    var votePct = parseInt((tally[vt][id]/tally[vt]['total']) * 100);
			    organizer.eventplan[idx][vt][id].votePct = votePct;
			}
		    }
		    req.session.currentPlan = organizer.eventplan[idx];
		    req.session.organizer = organizer;
		    req.session.organizer.saveCurrentPlan(req.session.currentPlan);
		    return _respond(err,req.session.currentPlan,req,me);
		}
	    }
	};

	//fetch the updated event
	Customer.findPlanByGuid(req.session.currentPlan.config.guid,handleOrganizer);

    }

}