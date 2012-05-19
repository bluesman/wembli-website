var wembliModel   = require('wembli-model'),
    Customer      = wembliModel.load('customer');

module.exports = {
    req: function(req,res) { return req; },
    res: function(req,res) { return res; },
    session: function(req, res){ return req.session },

    //navigation
    tabs: function(req,res) {
	var tabs = [];

	if (req.session.loggedIn) {
	    tabs.push({name:'dashboard', label:'Dashboard', url:'/dashboard'});
	    tabs.push({name:'logout', label:'Log Out', url:'/logout'});
	} else {
	    tabs.push({name:'index', label:'Home', url:'/'});
	    tabs.push({name:'signup', label:'Sign Up', url:'#signupModal',modal:'modal'});
	    tabs.push({name:'login', label:'Log In To Your Dashboard', url:'#loginModal',modal:'modal'});
	}
	return tabs;
    },

    params: function(req,res) {
	return req.params;
    },

    plan: function(req,res) {
	return req.session.currentPlan;
    },

    finalTicketChoice: function(req,res) {
	if ((typeof req.session.currentPlan.tickets != "undefined") && (typeof req.session.currentPlan.config != "undefined")) {	
	    //loop through tix and see if one has the finalChoice param
	    for (tixId in req.session.currentPlan.tickets) {
		var ticket = req.session.currentPlan.tickets[tixId];
		if (typeof ticket.finalChoice != "undefined" && ticket.finalChoice) {
		    return ticket;
		}
	    }
	}
	return null;
    },
    friendsCount: function(req,res) {
	var friendCnt  = 1
	if ((typeof req.session.currentPlan.friends != "undefined") && (typeof req.session.currentPlan.config != "undefined")) {
	    for (idx in req.session.currentPlan.friends) {
		var friend = req.session.currentPlan.friends[idx];
		if (typeof friend.decision != "undefined" && !friend.decision) {
		    continue;
		} else {
		    friendCnt++;
		}
	    }
	}
	return friendCnt;
    },

    allFriends: function(req,res) {
	var friends = [];
	var seen = {}
	if ((typeof req.session.customer != "undefined") && (typeof req.session.customer.eventplan != "undefined")) {
	    for (idx in req.session.customer.eventplan) {
		var plan = req.session.customer.eventplan[idx];
		if (typeof plan.friends != "undefined") {
		    for (idx2 in plan.friends) {
			var id = ((typeof plan.friends[idx2].addMethod != "undefined") && (plan.friends[idx2].addMethod == 'facebook')) ? plan.friends[idx2].fbId : plan.friends[idx2].email;
			if (typeof seen[id] == "undefined") {
			    friends.push(plan.friends[idx2]);
			    seen[id] = true;
			}			    
		    }
		}
	    }
	}
	return friends;
    },
    
};

