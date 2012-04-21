var wembliModel   = require('wembli-model'),
    Customer      = wembliModel.load('customer'),
    redis         = require("redis"),
    redisClient   = redis.createClient(),
    uuid          = require('node-uuid'),
    ticketNetwork = require('../lib/wembli/ticketnetwork');

module.exports = function(app) {

    //add friends to the currentPlan
    app.all('/plan/friends/:guid?/:token?',function(req,res) {
	//this is the meat of the friends function
	var callback = function() {
	    //they must have a currentPlan to add friends to
	    if (typeof req.session.currentPlan == "undefined") {
		req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	    }

	    //if i'm not the organizer, gtfo
	    if (!req.session.currentPlan.config.isOrganizer) {
		req.flash('error','Only organizers can view that page.');
		return res.redirect('/');
	    }

	    //if they got to this step after completing a previous step
	    //then mark that previous step as completed
	    if (req.param("completed")) {
		console.log('completed: '+req.param("completed"));
		req.session.currentPlan.completed[req.param("completed")] = true;
	    }

	    //if they are logged in and did not supply a guid, save the plan
	    //(if they did supply a guid, don't save it cause we just fetched it)
	    if (req.session.loggedIn && !req.param('guid')) {
		console.log('saving current plan to this customer');
		//this is async but we don't need to wait (i don't think)
		req.session.customer.saveCurrentPlan(req.session.currentPlan);
	    }

	    //render the friends template
	    return res.render('friends', {
		title:       'wembli.com - friends.',
		page:        'friends',
		cssIncludes: [],
		jsIncludes:  ['/js/friends.js']
	    });
	};

	if(req.param('guid')) {
	    console.log('setting current plan');
	    _setCurrentPlan({req:  req,
			     res:  res,
			     guid: req.param('guid')},callback);
	} else {
	    console.log('no guid');
	    callback();
	}
    });


    //add tickets to the currentPlan or view the tickets in the plan if not the organizer
    app.all('/plan/tickets/:guid?/:token?',function(req,res) {
	var callback = function() {

	    //they must have a currentPlan to add tix to
	    if (typeof req.session.currentPlan == "undefined") {
		req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	    }

	    //if they got to this step after completing a previous step
	    //then mark that previous step as completed
	    if (req.param("completed")) {
		console.log('completed: '+req.param("completed"));
		req.session.currentPlan.completed[req.param("completed")] = true;
	    }

	    //if they are logged in and did not supply a guid, save the plan
	    //(if they did supply a guid, don't save it cause we just fetched it)
	    if (req.session.loggedIn && !req.param('guid')) {
		console.log('saving current plan to this customer');
		//this is async but we don't need to wait (i don't think)
		req.session.customer.saveCurrentPlan(req.session.currentPlan);
	    }

	    //set friend in the session
	    if (req.param('guid') && req.param('token')) {
		if (!_setFriend({req:req})) {
		    //this guid doesn't have a friend with this token
		    req.flash('error','Invalid token for this event.');
		    return res.redirect('/');
		}
	    }

	    //if there is a guid but they are not the organizer of this guid then they can't edit
	    if (req.param('guid') && (req.param('guid') != req.session.currentPlan.config.guid)) {
		
		//remap the tickets to an array
		var tix = [];
		for (var tixId in req.session.currentPlan.tickets) {
		    tix.push(req.session.currentPlan.tickets[tixId]);
		}

		return res.render('tickets', {
		    title:'wembli.com - tickets.',
		    page:'tickets',
		    tickets:tix,
		    cssIncludes: [],
		    jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/tickets.js']
		});
	    }

	    //they are the organizer of this plan
	    if (req.session.currentPlan.config.isOrganizer) {
		
		ticketNetwork.GetTickets({eventID: req.session.currentPlan.event.ID},function(err,tickets) {
		    res.render('tickets', {
			title:'wembli.com - tickets.',
			page:'tickets',
			tickets:tickets.TicketGroup?tickets.TicketGroup:[],
			cssIncludes: [],
			jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/tickets.js']
		    });
		});

	    } else {
		var tix = [];
		for (var tixId in req.session.currentPlan.tickets) {
		    tix.push(req.session.currentPlan.tickets[tixId]);
		}
		res.render('tickets', {
		    title:'wembli.com - tickets.',
		    page:'tickets',
		    tickets:tix,
		    cssIncludes: [],
		    jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/tickets.js']
		});
	    }
	};

	if(req.param('guid')) {
	    console.log('setting current plan');
	    _setCurrentPlan({req:  req,
			     res:  res,
			     guid: req.param('guid')},callback);
	} else {
	    callback();
	}


    });

    //currentPlan summary
    app.all('/plan/summary/:guid?/:token?',function(req,res) {

	var callback = function() {
	    //they must have a currentPlan to add friends to
	    if (typeof req.session.currentPlan == "undefined") {
		req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	    }

	    //if i'm not the organizer, gtfo
	    if (!req.session.currentPlan.config.isOrganizer) {
		req.flash('error','Only organizers can view that page.');
		return res.redirect('/');
	    }

	    //if they got to this step after completing a previous step
	    //then mark that previous step as completed
	    if (req.param("completed")) {
		console.log('completed: '+req.param("completed"));
		req.session.currentPlan.completed[req.param("completed")] = true;
	    }

	    //if they are logged in and did not supply a guid, save the plan
	    //(if they did supply a guid, don't save it cause we just fetched it)
	    if (req.session.loggedIn && !req.param('guid')) {
		console.log('saving current plan to this customer');
		//this is async but we don't need to wait (i don't think)
		req.session.customer.saveCurrentPlan(req.session.currentPlan);
	    }


	    res.render('summary', {
		event:req.session.currentPlan.event,
		title: 'wembli.com - Plan Summary.',
		page:'summary',
		cssIncludes: [],
		jsIncludes: ['','/js/summary.js']
	    });
	

	};

	if(req.param('guid')) {
	    console.log('setting current plan');
	    _setCurrentPlan({req:  req,
			     res:  res,
			     guid: req.param('guid')},callback);
	} else {
	    console.log('no guid');
	    callback();
	}

    });

    //organizer or friend view of the currentPlan
    app.all('/plan/view/:guid?/:token?/:action?',function(req,res) {
	//if they don't have a guid they have to have a current plan
	if (!req.param('guid') && (typeof req.session.currentPlan == "undefined")) {
		req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	}

	var callback = function() {
	    //they must have a currentPlan to view to
	    if (typeof req.session.currentPlan == "undefined") {
		req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	    }

	    //if there is a guid but they are not the organizer of this guid then they can't edit
	    if (req.param('guid') && (req.param('guid') != req.session.currentPlan.config.guid)) {
		return res.render('friend-view', {
		    layoutContainer:true,
		    action:req.param('action'),
		    title: 'wembli.com - View Event Plan.',
		    page:'friends',
		    cssIncludes: [],
		    jsIncludes: ['/js/friend-view.js']
		});
	    }

	    //set friend in the session
	    if (req.param('guid') && req.param('token') && req.param('action')) {
		if (!_setFriend({req:req,action:req.param('action'),countView:true})) {
		    //this guid doesn't have a friend with this token
		    req.flash('error','Invalid token for this event.');
		    return res.redirect('/');
		}

		return res.render('friend-view', {
		    layoutContainer:true,
		    action:req.param('action'),
		    title: 'wembli.com - View Event Plan.',
		    page:'friends',
		    cssIncludes: [],
		    jsIncludes: ['/js/friend-view.js']
		});

	    }

	    //render the appropriate view
	    if (req.session.currentPlan.config.isOrganizer) {
		return res.render('organizer-view', {
		    title: 'wembli.com - View Event Plan.',
		    layoutContainer: true,
		    page:'organizer',
		    cssIncludes: [],
		    jsIncludes: ['/js/organizer-view.js']
		});
	    } else {
		return res.render('friend-view', {
		    layoutContainer:true,
		    action:req.param('action'),
		    title: 'wembli.com - View Event Plan.',
		    page:'friends',
		    cssIncludes: [],
		    jsIncludes: ['/js/friend-view.js']
		});
	    }

	};

	var guid = req.param('guid') ? req.param('guid') : req.session.currentPlan.config.guid;
	//fetch the plan for this guid from the db and set it in the session
	_setCurrentPlan({req:  req,
			 res:  res,
			 guid: guid},callback);

    });

    /*
     * private functions
     *
     */
    function _setFriend(args) {
	var plan = args.req.session.currentPlan;
	//a friend is viewing the page - find the friend in the currentPlan that has a matching token
	//and store that as session.friend
	for (email in plan.friends) {
	    console.log('checking frined: '+email+ ' looking for token match');
	    //if the friend has a token and it matches the token param
	    if ((typeof plan.friends[email].token != "undefined") && (plan.friends[email].token.token == args.req.param('token'))) {
		console.log('found a token match');
		if (typeof args.countView != "undefined") {
		    var voteCnt = (typeof plan.friends[email][args.action].view == "undefined") ? 1 : plan.friends[email][args.action].view + 1;
		    plan.friends[email][args.action].view = voteCnt;
		    plan.friends[email][args.action].viewLastDate = new Date().format("m/d/yy h:MM TT Z");
		}

		args.req.session.friend            = {};
		args.req.session.friend.email      = email;
		args.req.session.friend.last_name  = plan.friends[email].lastName;
		args.req.session.friend.first_name = plan.friends[email].firstName;
		args.req.session.friend.token      = plan.friends[email].token;
		return true;
	    }
	}
	return false;
    }


    function _setCurrentPlan(args,callback) {

	var handleOrganizer = function(err,organizer) {
	    if (err) {
		args.req.flash('error','Something went wrong :) '+err);
		return args.res.redirect('/');
	    }

	    //if there's no organizer but also no error then they are trying to view a plan
	    //that doesn't exist in the database..that's not allowed, gtfo
	    if (!organizer) {
		args.req.flash('error','The plan you tried to view does not exist.');
		return args.res.redirect('/');
	    }
	    
	    //get the plan
	    for (var idx in organizer.eventplan) {
		if (organizer.eventplan[idx].config.guid == args.guid) {
		    //set the current plan in the session
		    args.req.session.currentPlan = organizer.eventplan[idx];
		    break;
		}
	    }
	    //if there's no currentPlan we have a major problem
	    if (typeof args.req.session.currentPlan == "undefined") {
		args.req.flash('error','The plan you tried to view does not exist.');
		return args.res.redirect('/');
	    }
	    
	    //if organizer == customer then set isOrganizer
	    if ((typeof args.req.session.customer != "undefined") && (args.req.session.customer.email == organizer.email)) {
		args.req.session.customer = organizer;
		args.req.session.currentPlan.config.isOrganizer = true;
	    } else {
		args.req.session.currentPlan.config.isOrganizer = false;;
	    }
	    
	    args.req.session.organizer = organizer;
	    callback();
	};

	Customer.findPlanByGuid(args.guid,handleOrganizer);

    };


};