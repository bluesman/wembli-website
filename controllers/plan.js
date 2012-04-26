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
	    if (typeof req.session.currentPlan.config == "undefined") {
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
	    if (typeof req.session.currentPlan.config == "undefined") {
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
	    console.log('setting current plan: '+req.param('guid'));
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
	    if (typeof req.session.currentPlan.config == "undefined") {
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
	if (!req.param('guid') && (typeof req.session.currentPlan.config == "undefined")) {
		req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	}

	//if there is a guid but they are not logged in and there is no token - gtfo
	if (req.param('guid') && !req.session.loggedIn && !req.param('token')) {
		req.flash('error','The plan you\'re trying to view is by invitation only.');
		return res.redirect('/');
	}	    

	var callback = function() {
	    console.log('foo in callback: ');
	    console.log(req.session.foo);
	    //they must have a currentPlan to view to
	    if (typeof req.session.currentPlan.config == "undefined") {
		req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	    }

	    console.log('session after: ');
	    console.log(req.session);
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
		    var poop = JSON.stringify(organizer.eventplan[idx]);
		    console.log(poop);
		    var pooper = JSON.parse(poop);
		    for (key in pooper) {
			console.log(key);
		    }
		    //if (typeof args.req.session.foo != "undefined") {
		    //console.log('foo: ');
		    //console.log(args.req.session.foo);
		//}
		    //args.req.session.currentPlan = pooper;
		    //args.req.session.foo = {foo:'bar8'};
		    //console.log('new foo: ');
		    //console.log(args.req.session.foo);
		    args.req.session.currentPlan = organizer.eventplan[idx];

		    //console.log(poop.toJSON());
		    //args.req.session.currentPlan = {"config":{"voteBy":"04/26/2012","isOrganizer":true,"guid":"e2663ec0-8dc9-11e1-ad46-13358f0c036d","payment":"group","summary":true,"hotels":false,"restaurants":false,"parking":false,"tickets":true,"friends":true},"tickets":{"123":{"ActualPrice":"8","TicketQuantity":"7"}},"event":{"CountryID":"217","VenueID":"1295","VenueConfigurationID":"2947","Venue":{"ZipCode":"92111","Street1":"100 Park Blvd.","StateProvince":"California","NumberOfConfigurations":"4","Name":"Petco Park","ID":"1295","Country":"United States of America","City":"San Diego","Capacity":"42445"},"StateProvinceID":"5","StateProvince":"CA","ParentCategoryID":"1","Name":"San Diego Padres vs. Washington Nationals","MapURL":"http://seatics.tickettransaction.com/PetcoPark_SanDiegoPadres_2011-12-06_2011-12-06_1000_tn.gif","IsWomensEvent":"false","ID":"1734131","GrandchildCategoryID":"16","DisplayDate":"04/26/2012 7:05PM","Date":"2012-04-26T19:05:00","Clicks":"1","City":"San Diego","ChildCategoryID":"63"},"_id":"4f9632e9bfea02891a000030","date_created":"2012-04-24T04:58:17.649Z"};

		    //args.req.session.currentPlan = {"config":{"guid":"fa4b87d0-8f5d-11e1-8b6d-a7107e9183cf","isOrganizer":true},"event":{"CountryID":"217","VenueID":"954","VenueConfigurationID":"8983","Venue":{"ZipCode":"92101","Street1":"3rd Ave And B Street","StateProvince":"California","NumberOfConfigurations":"3","Name":"San Diego Civic Theatre","ID":"954","Country":"United States of America","City":"San Diego","Capacity":"3000"},"StateProvinceID":"5","StateProvince":"CA","ParentCategoryID":"3","Name":"Barber Of Seville","MapURL":"http://seatics.tickettransaction.com/SanDiegoCivicTheatre_YoGabbaGabba-Zone-ZP_2011-11-20_2011-10-29_1028_tn.gif","IsWomensEvent":"false","ID":"1633301","GrandchildCategoryID":"25","DisplayDate":"04/27/2012 8:00PM","Date":"2012-04-27T20:00:00","Clicks":"0","City":"San Diego","ChildCategoryID":"75"},"_id":"4f98ea6c8590bf030c00002f","date_created":"2012-04-26T06:25:48.680Z"};

		    console.log('guid for new currentplan is: '+args.guid);
		    break;
		}
	    }
	    //if there's no currentPlan we have a major problem
	    if (typeof args.req.session.currentPlan.config == "undefined") {
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