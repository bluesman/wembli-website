var wembliModel   = require('wembli-model'),
    Customer      = wembliModel.load('customer'),
    crypto        = require('crypto'),
    mailer        = require("wembli/sendgrid"),
    uuid          = require('node-uuid'),
    payPal        = require('../lib/wembli/paypal'),
    async         = require('async'),
    ticketNetwork = require('../lib/wembli/ticketnetwork');

var Facebook = require('facebook-client').FacebookClient;
var facebook_client = new Facebook(app.settings.fbAppId,app.settings.fbAppSecret,{timeout:10000});

module.exports = function(app) {

    //add friends to the currentPlan
    app.all('/plan/friends/:guid?/:token?',function(req,res) {
	//this is the meat of the friends function
	var callback = function() {
	    //they must have a currentPlan to add friends to
	    if (typeof req.session.currentPlan.config == "undefined") {
		//req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	    }

	    //if i'm not the organizer, gtfo
	    if (!req.session.isOrganizer) {
		req.flash('error','Only organizers can view that page.');
		return res.redirect('/');
	    }

	    //if they got to this step after completing a previous step
	    //then mark that previous step as completed
	    if (req.param("completed")) {
		req.session.currentPlan.completed[req.param("completed")] = true;
	    }

	    var needToSave = false;

	    //if they are logged in and did not supply a guid, save the plan
	    //(if they did supply a guid, don't save it cause we just fetched it)
	    if (req.session.loggedIn && !req.param('guid')) {
		needToSave = true;
	    }

	    
	    if (needToSave) {
		//this is async but we don't need to wait (i don't think)
		req.session.customer.saveCurrentPlan(req.session.currentPlan);
	    }

	    //set the login redirect url
	    req.session.redirectUrl = req.url;
	    //req.session.redirectMsg = 'Successfully logged in and saved your work.';

	    //render the friends template
	    return res.render('friends', {
		title:       'wembli.com - friends.',
		page:        'friends',
		cssIncludes: [],
		jsIncludes:  ['/js/friends.js']
	    });
	};

	if(req.param('guid')) {
	    _setCurrentPlan({req:  req,
			     res:  res,
			     guid: req.param('guid')},callback);
	} else {
	    callback();
	}
    });


    //add tickets to the currentPlan or view the tickets in the plan if not the organizer
    app.all('/plan/tickets/:guid?/:token?',function(req,res) {
	console.log('tickets loading...');
	var callback = function() {

	    //they must have a currentPlan to add tix to
	    if (typeof req.session.currentPlan.config == "undefined") {
		//req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	    }

	    //if they got to this step after completing a previous step
	    //then mark that previous step as completed
	    if (req.param("completed")) {
		//add feed item saying this thing was completed
		var feedName = req.param("completed") + 'Completed';
		var action = {name:feedName};
		var meta = {};
		var activity = {action:action,
				meta:meta,
				time:Date.now()
			       };
		console.log('added feed: ');
		console.log(activity);
		if (typeof req.session.currentPlan.feed == "undefined") {
		    req.session.currentPlan.feed = [activity];
		} else {
		    req.session.currentPlan.feed.push(activity);
		}
		req.session.currentPlan.completed[req.param("completed")] = true;
	    }

	    //if they are logged in and did not supply a guid, save the plan
	    //(if they did supply a guid, don't save it cause we just fetched it)
	    if (req.session.loggedIn && !req.param('guid')) {
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

	    //set the login redirect url
	    req.session.redirectUrl = req.url;
	    //req.session.redirectMsg = 'Successfully logged in and saved your work.';

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
		    //jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/tickets.js']
		    jsIncludes: ['/js/tickets.js']
		});
	    }

	    //they are the organizer of this plan
	    if (req.session.isOrganizer) {
		if ((typeof req.session.currentPlan.completed.purchasedTickets != "undefined") && req.session.currentPlan.completed.purchasedTickets) {
		    var tix = [];
		    for (var tixId in req.session.currentPlan.tickets) {
			if ((typeof req.session.currentPlan.tickets[tixId].finalChoice != "undefined") && req.session.currentPlan.tickets[tixId].finalChoice) {
			    tix.push(req.session.currentPlan.tickets[tixId]);
			}
		    }
		    res.render('tickets', {
			title:'wembli.com - tickets.',
			page:'tickets',
			tickets:tix,
			cssIncludes: [],
			jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/tickets.js']
		    });
		} else {

		    ticketNetwork.GetTickets({eventID: req.session.currentPlan.event.ID},function(err,tickets) {
			console.log('tickets in plan.js');
			console.log(tickets);
			res.render('tickets', {
			    title:'wembli.com - tickets.',
			    page:'tickets',
			    tickets:tickets.TicketGroup?tickets.TicketGroup:[],
			    cssIncludes: [],
			    jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js','/js/tickets.js']
			});
		    });
		}

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
		//req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	    }

	    //if i'm not the organizer, gtfo
	    if (!req.session.isOrganizer) {
		req.flash('error','Only organizers can view that page.');
		return res.redirect('/');
	    }

	    //if they got to this step after completing a previous step
	    //then mark that previous step as completed
	    if (req.param("completed")) {
		req.session.currentPlan.completed[req.param("completed")] = true;
	    }

	    //if they are logged in and did not supply a guid, save the plan
	    //(if they did supply a guid, don't save it cause we just fetched it)
	    if (req.session.loggedIn && !req.param('guid')) {
		//this is async but we don't need to wait (i don't think)
		req.session.customer.saveCurrentPlan(req.session.currentPlan);
	    }

	    //set the login redirect url
	    req.session.redirectUrl = req.url;
	    //req.session.redirectMsg = 'Successfully logged in and saved your work.';

	    //if they are not logged in but have facebook auth data, log them in using fb auth
	    if (!req.session.loggedIn) {
		//return res.redirect('/auth/facebook');
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
	    _setCurrentPlan({req:  req,
			     res:  res,
			     guid: req.param('guid')},callback);
	} else {
	    callback();
	}

    });

    app.all('/plan/public/:guid?/:token?/:action?/:source?',function(req,res) {
	if (req.param('source')) {
	    //if source is 'fb' send them to auth/facebook and redirect them back here
	    req.session.redirectUrl = '/plan/public/'+req.param('guid')+'/'+req.param('token')+'/'+req.param('action');
	    if (req.param('source') == 'fb') {
		return res.redirect('/auth/facebook');
	    }
	}

	//if there's a token - put it in the session. if they sign up i'll check the token to make sure the email+token combo they sign up for matches
	//a plan with a friend+token.  if it doesn't match then the email address should not be automatically confirmed
	if (req.param('token')) {
	    console.log('setting token: '+req.param('token'));
	    req.session.token = req.param('token');
	}
	

	//get the event details for this guid
	Customer.findPlanByGuid(req.param('guid'),function(err,c) {
	    if (err || c == null) {
		return res.redirect('/');
	    }

	    for (var i in c.eventplan) {
		if (typeof c.eventplan[i] == "undefined") {
		    continue;
		}
		if (typeof c.eventplan[i].config == "undefined") {
		    continue;
		}

		if (c.eventplan[i].config.guid == req.param('guid')) {
		    req.session.isOrganizer = false;
		    req.session.currentPlan = c.eventplan[i]
		    req.session.organizer = c;
		    return res.render('public-view', {
			layoutContainer:true,
			action:req.param('action'),
			title: 'wembli.com - View Event Plan.',
			page:'public',
			token:req.param('token'),
			cssIncludes: [],
			jsIncludes: ['/js/public-view.js']
		    });
		}
	    }

	    if (!req.session.loggedIn) {
		return res.redirect('/');
	    } else {
		return res.redirect('/dashboard');
	    }
	});
    });

    app.all('/plan/itinerary/:guid?/:token?/:action?/:source?',function(req,res) {

	if (req.param('source') && !(req.session.loggedIn)) {
	    //if source is 'fb' send them to auth/facebook and redirect them back here
	    req.session.redirectUrl = '/plan/view/'+req.param('guid')+'/'+req.param('token')+'/'+req.param('action');
	    if (req.param('source') == 'fb') {
		console.log('source is fb - logging in then redirecting to: '+req.session.redirectUrl);
		return res.redirect('/auth/facebook');
	    }
	}

	//determine the public url to redirect to if they are not allowed
	var publicViewUrl = '/plan/public/';
	var hasGuid = false;
	if (req.param('guid')) {
	    publicViewUrl += req.param('guid');
	    hasGuid = true;
	} else if (typeof req.session.currentPlan.config != "undefined") {
	    publicViewUrl += req.session.currentPlan.config.guid;
	    hasGuid = true;
	}
	if (hasGuid) {
	    if (req.param('token')) {
		publicViewUrl += '/'+req.param('token');
	    }
	    if (req.param('action')) {
		publicViewUrl += '/'+req.param('action');
	    }
	}

	/*
	  different levels of access:
	  1. public:
	  - not logged in
	  - logged in but not invited and not the organizer
	  2. friend view
	  - logged in and invited but not the organizer
	  3. logged in and is the organizer
	*/

	//if they are not logged in, send them to the public view
	if (!req.session.loggedIn) {
	    req.session.redirectUrl = req.url;
	    return res.redirect(publicViewUrl);
	}

	//if there is no passed in guid they have to have a current plan
	if (!req.param('guid') && (typeof req.session.currentPlan.config == "undefined")) {
	    //req.flash('error','An error occurred. Please start a new plan.');
	    return res.redirect(publicViewUrl);
	}

	var callback = function() {
	    //they must have a currentPlan to view to
	    if (typeof req.session.currentPlan.config == "undefined") {
		//no currentPlan means they are not allowed to see this plan
		req.session.redirectUrl = req.url;
		return res.redirect(publicViewUrl);
	    }

	    //set friend in the session
	    if (req.param('guid') && req.param('token') && req.param('action')) {
		if (!_setFriend({req:req,action:req.param('action'),countView:true})) {
		    //this guid doesn't have a friend with this token
		    req.flash('error','Invalid token for this event.');
		    return res.redirect('/');
		}
		console.log('rendering friend itinerary');
		return res.render('friend-itinerary', {
		    layoutContainer:true,
		    action:req.param('action'),
		    title: 'wembli.com - View Event Plan.',
		    page:'itinerary',
		    token:req.param('token'),
		    cssIncludes: [],
		    jsIncludes: []
		});

	    }

	    //render the appropriate view
	    if (req.session.isOrganizer) {
		return res.render('organizer-itinerary', {
		    title: 'wembli.com - View Event Plan.',
		    layoutContainer: true,
		    page:'organizer',
		    cssIncludes: [],
		    jsIncludes: []
		});
	    } else {
		console.log('not organizer rendering friend view');
		return res.render('friend-itinerary', {
		    layoutContainer:true,
		    action:req.param('action'),
		    title: 'wembli.com - View Event Plan.',
		    page:'itinerary',
		    token:req.param('token'),
		    cssIncludes: [],
		    jsIncludes: [],
		});
	    }
	};

	var guid = req.param('guid') ? req.param('guid') : req.session.currentPlan.config.guid;
	//fetch the plan for this guid from the db and set it in the session
	_setCurrentPlan({req:  req,
			 res:  res,
			 guid: guid},callback);


    });


    //organizer or friend view of the currentPlan
    app.all('/plan/view/:guid?/:token?/:action?/:source?',function(req,res) {
	if (req.param('source')) {
	    //if source is 'fb' send them to auth/facebook and redirect them back here
	    req.session.redirectUrl = '/plan/view/'+req.param('guid')+'/'+req.param('token')+'/'+req.param('action');
	    if (req.param('source') == 'fb') {
		console.log('source is fb - logging in then redirecting to: '+req.session.redirectUrl);
		return res.redirect('/auth/facebook');
	    }
	}

	//if there's a token - put it in the session. if they sign up i'll check the token to make sure the email+token combo they sign up for matches
	//a plan with a friend+token.  if it doesn't match then the email address should not be automatically confirmed
	if (req.param('token')) {
	    req.session.token = req.param.token;
	}
	
	//determine the public url to redirect to if they are not allowed
	var publicViewUrl = '/plan/public/';
	var hasGuid = false;
	if (req.param('guid')) {
	    publicViewUrl += req.param('guid');
	    hasGuid = true;
	} else if (typeof req.session.currentPlan.config != "undefined") {
	    publicViewUrl += req.session.currentPlan.config.guid;
	    hasGuid = true;
	}
	if (hasGuid) {
	    if (req.param('token')) {
		publicViewUrl += '/'+req.param('token');
	    }
	    if (req.param('action')) {
		publicViewUrl += '/'+req.param('action');
	    }
	}

	/*
	  different levels of access:
	  1. public:
	  - not logged in
	  - logged in but not invited and not the organizer
	  2. friend view
	  - logged in and invited but not the organizer
	  3. logged in and is the organizer
	*/

	//if they are not logged in, send them to the public view
	if (!req.session.loggedIn) {
	    req.session.redirectUrl = req.url;
	    return res.redirect(publicViewUrl);
	}

	//if there is no passed in guid they have to have a current plan
	if (!req.param('guid') && (typeof req.session.currentPlan.config == "undefined")) {
	    //req.flash('error','An error occurred. Please start a new plan.');
	    return res.redirect(publicViewUrl);
	}

	var callback = function() {
	    //they must have a currentPlan to view to
	    if (typeof req.session.currentPlan.config == "undefined") {
		//no currentPlan means they are not allowed to see this plan
		req.session.redirectUrl = req.url;
		return res.redirect('/');
	    }

	    //set the login redirect url
	    req.session.redirectUrl = req.url;
	    //req.session.redirectMsg = 'Successfully logged in and saved your work.';


	    //set friend in the session
	    if (req.param('guid') && req.param('token') && req.param('action')) {
		if (!_setFriend({req:req,action:req.param('action'),countView:true})) {
		    
		    //this guid doesn't have a friend with this token
		    req.flash('error','Invalid token for this event.');
		    return res.redirect('/');
		}
		console.log('logged in?'+req.session.loggedIn);
		console.log('rendering friend view');
		console.log('not organizer rendering friend view');
		if ((typeof req.session.friend.payment != "undefined") && (req.session.friend.payment.payKey)) {
		    var paymentLink = payPal.redirectUrl(req.session.friend.payment.payKey);
		}

		return res.render('friend-view', {
		    layoutContainer:true,
		    action:req.param('action'),
		    title: 'wembli.com - View Event Plan.',
		    page:'friends',
		    token:req.param('token'),
		    cssIncludes: [],
		    paymentLink:paymentLink,
		    jsIncludes: ['/js/friend-view.js']
		});

	    }

	    //render the appropriate view
	    if (req.session.isOrganizer) {
		//if is organizer and voting is not yet completed and there's only 1 ticket option
		//set voting automatically to completed
		if (!req.session.currentPlan.completed.voting && (Object.keys(req.session.currentPlan.tickets).length == 1)) {
		    console.log('theres only 1 ticket');
		    req.session.currentPlan.completed.voting = true;
		    //set this ticket option to finalChoice
		    for (var idx in req.session.currentPlan.tickets) {
			req.session.currentPlan.tickets[idx].finalChoice = true;
		    }
		    req.session.customer.saveCurrentPlan(req.session.currentPlan, function() {
			return res.render('organizer-view', {
			    title: 'wembli.com - View Event Plan.',
			    layoutContainer: true,
			    page:'organizer',
			    cssIncludes: [],
			    jsIncludes: ['/js/organizer-view.js']
			});
		    });
		} else {
		    return res.render('organizer-view', {
			title: 'wembli.com - View Event Plan.',
			layoutContainer: true,
			page:'organizer',
			cssIncludes: [],
			jsIncludes: ['/js/organizer-view.js']
		    });
		}

	    } else {
		console.log('not organizer rendering friend view');
		if ((typeof req.session.friend.payment != "undefined") && (req.session.friend.payment.payKey)) {
		    var paymentLink = payPal.redirectUrl(req.session.friend.payment.payKey);
		}
		return res.render('friend-view', {
		    layoutContainer:true,
		    action:req.param('action'),
		    title: 'wembli.com - View Event Plan.',
		    page:'friends',
		    token:req.param('token'),
		    cssIncludes: [],
		    jsIncludes: ['/js/friend-view.js'],
		    paymentLink:paymentLink
		});
	    }
	};

	var guid = req.param('guid') ? req.param('guid') : req.session.currentPlan.config.guid;
	//fetch the plan for this guid from the db and set it in the session
	_setCurrentPlan({req:  req,
			 res:  res,
			 guid: guid},callback);

    });


    app.all('/plan/collect-payment',function(req,res) {
	if (!req.param('ticketChoice')) {
	    //req.flash('plan-msg','An error occurred. No ticket choice provided.');
	    return res.redirect('/plan/view');
	}

	//if they don't have a guid they have to have a current plan
	if (!req.param('guid') && (typeof req.session.currentPlan.config == "undefined")) {
	    //req.flash('error','An error occurred. Please start a new plan.');
	    return res.redirect('/');
	}
	
	//if there is a guid but they are not logged in and there is no token - gtfo
	if (req.param('guid') && !req.session.loggedIn && !req.param('token')) {
	    req.flash('error','The plan you\'re trying to view is by invitation only. Please login to confirm you are invited.');
	    return res.redirect('/');
	}	    

	//set the appropriate ticket group to have finalChoice = true
	if (typeof req.session.currentPlan.tickets[req.param('ticketChoice')] == "undefined") {
	    //req.flash('plan-msg','An error occurred. No ticket choice provided.');
	    return res.redirect('/plan/view');
	} else {	    
	    req.session.currentPlan.tickets[req.param('ticketChoice')].finalChoice = true;
	}
	

	var sendCollectPayment = function(friend,callback) {
	    //don't send email to friends that have declined
	    if (typeof friend.decision != "undefined" && !friend.decision) {
		return callback();
	    }

	    //only send	1 email if friendEmailId param
	    //TODO: prevent spammers? only send 3 emails per friend
	    if (req.param('friendEmailId')) {
		var friendEmailId = ((typeof friend.addMethod != "undefined") && (friend.addMethod == 'facebook')) ? friend.fbId : friend.email;
		if (req.param('friendEmailId') != friendEmailId) {
		    return callback();
		} 
	    }
	    
	    //generate a token to identify this friend when they come back to pay
	    var friendToken = "";
	    if (typeof friend.token == "undefined") {
		hash = crypto.createHash('md5');
		var friendTimestamp = new Date().getTime().toString();
		hash.update(friend.id+friendTimestamp);
		friendToken = hash.digest(encoding='base64');
		friendToken = friendToken.replace(/\//g,'');	    
		friend.token = {timestamp: friendTimestamp,token: friendToken};
	    } else {
		friendToken = friend.token.token;
	    }
	    
	    if (req.param('sendMessage')) {
		var name = 'A friend';
		if ((typeof req.session.customer.first_name != "undefined") && (typeof req.session.customer.last_name != "undefined")) {
		    name = req.session.customer.first_name+' '+req.session.customer.last_name;
		}
		var subj = name+' has finalized plans for '+req.session.currentPlan.event.Name;
		
		var payLink = "http://"+app.settings.host+".wembli.com/plan/view/"+encodeURIComponent(req.session.currentPlan.config.guid)+"/"+encodeURIComponent(friendToken)+"/collectPayment";
		
		
		if ((typeof friend.addMethod != "undefined") && (friend.addMethod == "facebook")) {
		    //post to this friend's facebook wall
		    facebook_client.getSessionByAccessToken(req.session.fbAccessToken)(function(facebook_session) {
			if (!facebook_session) {
			    return res.redirect('/auth/facebook');
			}
			
			facebook_session.isValid()(function(is_valid) {
			    if (!is_valid) {
				return res.redirect('/auth/facebook');
			    }

			    //make a post for wembli
			    var apiCall = "/"+friend.fbId+"/feed";
			    //apiCall = "/me/feed"; //take this out after testing
			    //post args for fb
			    var msg = 'Hey '+friend.firstName+', glad you\'re coming to '+req.session.currentPlan.event.Name+'!';
			    var name = 'Click here to pony up for your part of the bill.';
			    var params = {
				message:msg,
				link:payLink+'/fb',
				name:name,
				description:'What happens next: [1] Pay your part of the bill, [2] Once everyone has paid, the Organizer will make the buy [3] Enjoy an awesome outing with friends'
			    };
			    
			    facebook_session.graphCall(apiCall,params,'POST')(function(result) {
				//flag the eventplan so we know we attempted to send the email
				friend.collectPayment = {initiated:1,initiatedLastDate:new Date().format("m/d/yy h:MM TT Z")};
				return callback();
			    });
			});
			
		    });
		} else {
		    res.render('email-templates/collect-payment', {
			layout:'email-templates/layout',
			payLink:payLink,
			friendToken:friendToken
		    },function(err,htmlStr) {
			var mail = {
			    from: '"Wembli Support" <help@wembli.com>',
			    to:friend.email,
			    headers: {
				'X-SMTPAPI': {
				    category : "collectPayment",
				    unique_args:{
					guid:req.session.currentPlan.config.guid,
					organizer:req.session.customer.email
				    }
				}
			    },
			};
			
			mail.subject = subj;
			
			//templatize this 
			mail.text = '';
			mail.html = htmlStr;
			mailer.sendMail(mail,function(error, success){
			    console.log("Message "+(success?"sent":"failed:"+error));
			});
			
			//flag the eventplan so we know we attempted to send the email
			friend.collectPayment = {initiated:1,initiatedLastDate:new Date().format("m/d/yy h:MM TT Z")};
			callback();
		    });
		}
	    } else {
		callback();
	    }
	};

	var finished = function(err) {
	    if (!err) {

		req.session.currentPlan.completed.voting = true;
		req.session.customer.saveCurrentPlan(req.session.currentPlan);

		//redirect to organizer view with flash message
		//	req.flash('plan-msg','Successfully sent messages to invited friends.');
	    }
	    res.redirect('/plan/view');
	};

	async.forEach(req.session.currentPlan.friends,sendCollectPayment,finished);

    });


    app.all('/plan/reset-payment',function(req,res) {
	//update payment to 0 for this friend
	if ((typeof req.session.friend != "undefined") && (typeof req.session.friend.token != "undefined")) {
	    var plan = req.session.currentPlan;
	    for (id in plan.friends) {
		if ((typeof plan.friends[id].token != "undefined") && (plan.friends[id].token.token == req.session.friend.token.token)) {
		    delete plan.friends[id].payment;
		    break;
		}
	    }
	    Customer.findOne({email:req.session.organizer.email},function(err,c) {
		c.saveCurrentPlan(plan);
		res.redirect('/plan/view/'+req.session.currentPlan.config.guid+'/'+req.session.friend.token.token+'/collectPaymemt');
	    });
	} else {
	    res.redirect('/plan/view/'+req.session.currentPlan.config.guid);
	}
    });    

    app.all('/plan/make-payment/:guid?/:token?',function(req,res) {
	//must be logged in and we need to have their email address

	var amountMethod = req.param('amount'); //did they pay for tickets? or an arbitrary amount?
	var amountQty    = req.param('amountQty'); //only relevant if amountMethod == 'byPerson'
	var arbitraryAmount = req.param('#arbitraryAmount'); //only relevant if amountMethod == 'arbitrary'
	var contribution = req.param('contribution'); //the amount the person wants to pay
	var token = req.param('token'); //token tells us who is making the payment
	var guid = req.param('guid'); //which plan 

	if (!req.param('contribution')) {
	    //req.flash('plan-msg','An error occurred. No ticket choice provided.');
	    return res.redirect('/plan/view/'+guid+'/'+token);
	}

	//if they don't have a guid they have to have a current plan
	if (!req.param('guid') && (typeof req.session.currentPlan.config == "undefined")) {
	    //req.flash('error','An error occurred. Please start a new plan.');
	    return res.redirect('/');
	}
	
	//if there is a guid but they are not logged in and there is no token - gtfo
	if (req.param('guid') && !req.session.loggedIn && !req.param('token')) {
	    req.flash('error','The plan you\'re trying to view is by invitation only. Please login to confirm you are invited.');
	    return res.redirect('/');
	}	    

	var callback = function() {
	    if (req.param('guid') && req.param('token')) {
		if (!_setFriend({req:req})) {
		    //this guid doesn't have a friend with this token
		    req.flash('error','Invalid token for this event.');
		    return res.redirect('/');
		}

		//send request to create transaction over to paypal
		//receiver is the organizer
		var receiverList = {"receiver":[{"amount":contribution,"email":req.session.organizer.email}]};
		var params = {token:req.param('token'),
			      guid:req.param('guid'),
			      receiverList:receiverList};
		payPal.Pay(params,function(err,results) {
		    if (err) {
			console.log('ERROR: '+err);
		    } else {
			results.contribution = contribution;
			results.initiated = 1;
			results.initiatedLastDate = new Date(results.responseEnvelope.timestamp).format("m/d/yy h:MM TT Z");
			//set the results in the session and mark that this person has paid
			var storePaymentInfo = function(friend,callback) {
			    if (friend.addMethod == 'facebook') {
				if (friend.fbId == req.session.friend.fbId) {
				    console.log('setting payment for friend');
				    friend.payment = results;
				}
			    } else {
				if (friend.email == req.session.friend.email) {
				    friend.payment = results;
				}				    
			    }
			    callback();
			};

			var finished = function(err) {
			    if (!err) {
				//redirect to paypal on success
				req.session.organizer.saveCurrentPlan(req.session.currentPlan,function(err) {
				    if (err) {
					//req.flash('plan-msg','An error occurred. No ticket choice provided.');
					return res.redirect('/plan/view/'+guid+'/'+token);
				    }
				    var redirectUrl = payPal.redirectUrl(results.payKey);
				    console.log('R: '+redirectUrl);
				    return res.render('paypal-redirect', {
					layout:false,
					redirectUrl: redirectUrl,
				    });
				});
			    }
			};

			async.forEach(req.session.currentPlan.friends,storePaymentInfo,finished);
		    }
		});
	    }
	};

	var guid = req.param('guid') ? req.param('guid') : req.session.currentPlan.config.guid;
	//fetch the plan for this guid from the db and set it in the session
	_setCurrentPlan({req:  req,
			 res:  res,
			 guid: guid},callback);

	
    });


    app.all('/plan/payment-feedback',function(req,res) {

	if (!req.param('purchasedTickets')) {
	    //req.flash('plan-msg','An error occurred. No ticket choice provided.');
	    return res.redirect('/plan/view');
	}

	//if they don't have a guid they have to have a current plan
	if (!req.param('guid') && (typeof req.session.currentPlan.config == "undefined")) {
	    //req.flash('error','An error occurred. Please start a new plan.');
	    return res.redirect('/');
	}
	
	//if there is a guid but they are not logged in and there is no token - gtfo
	if (req.param('guid') && !req.session.loggedIn && !req.param('token')) {
	    req.flash('error','The plan you\'re trying to view is by invitation only. Please login to confirm you are invited.');
	    return res.redirect('/');
	}	    

	/*
	  find the finalChoice and set payment appropriately:
	  yes-easy 
	  yes-hassle 
	  no 
	*/
	for (ticketId in req.session.currentPlan.tickets) {
	    var tix = req.session.currentPlan.tickets[ticketId];
	    if ((typeof tix.finalChoice != "undefined") && tix.finalChoice) {
		if (req.param('purchasedTickets') == 'no') {
		    delete tix.payment;
		} else {
		    req.session.currentPlan.completed.purchasedTickets = true;
		    tix.payment.payment = 1;
		    tix.payment.paymentLastDate = new Date().format("m/d/yy h:MM TT Z");
		    tix.payment.feedback = req.param('purchasedTickets');
		}
		req.session.customer.saveCurrentPlan(req.session.currentPlan);

		break;
	    }
	}
	return res.redirect('/plan/view');
    });


    /*
     * private functions
     *
     */
    function _setFriend(args) {
	if (typeof args.req.session.friend != "undefined") {
	    return true;
	}

	var plan = args.req.session.currentPlan;
	//they can't be the organizer if they are the friend
	args.req.session.isOrganizer = false;
	//a friend is viewing the page - find the friend in the currentPlan that has a matching token
	//and store that as session.friend
	for (id in plan.friends) {
	    //if the friend has a token and it matches the token param
	    if ((typeof plan.friends[id].token != "undefined") && (plan.friends[id].token.token == args.req.param('token'))) {
		//this token is a valid token for this guid, now is the person who is logged in the person that owns this token?
		//only way to tell is to compare email address or facebook id
		//if they were invited through facebook and login with an email address then we are screwed
		//use case 1: invited with facebook and logged in with facebook


		if (typeof args.countView != "undefined") {
		    if (typeof plan.friends[id][args.action] == "undefined") {
			plan.friends[id][args.action] = {};
			var voteCnt = 1;
		    } else {
			var voteCnt = (typeof plan.friends[id][args.action].view == "undefined") ? 1 : plan.friends[id][args.action].view + 1;
		    }
		    plan.friends[id][args.action].view = voteCnt;
		    plan.friends[id][args.action].viewLastDate = new Date().format("m/d/yy h:MM TT Z");
		}

		args.req.session.friend            = {};
		args.req.session.friend.email      = plan.friends[id].email;
		args.req.session.friend.fbId       = plan.friends[id].fbId;
		args.req.session.friend.last_name  = plan.friends[id].lastName;
		args.req.session.friend.first_name = plan.friends[id].firstName;
		args.req.session.friend.token      = plan.friends[id].token;
		args.req.session.friend.addMethod  = plan.friends[id].addMethod;
		args.req.session.friend.payment    = plan.friends[id].payment;
		args.req.session.friend.decision   = plan.friends[id].decision;
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
		//args.req.flash('error','The plan you tried to view does not exist.');
		return args.res.redirect('/');
	    }
	    
	    //get the plan
	    var thisPlan = null;
	    for (var idx in organizer.eventplan) {
		if (organizer.eventplan[idx].config.guid == args.guid) {
		    //set the current plan in the session
		    thisPlan = organizer.eventplan[idx];
		    break;
		}
	    }

	    //if there's no currentPlan we have a major problem
	    if (typeof thisPlan.config == "undefined") {
		//args.req.flash('error','The plan you tried to view does not exist.');
		return args.res.redirect('/');
	    }
	    

	    
	    //if organizer == customer then set isOrganizer
	    if ((typeof args.req.session.customer != "undefined") && (args.req.session.customer.email == organizer.email)) {
		console.log('setcurrentplan: session email == organizer email');
		args.req.session.currentPlan = thisPlan;
		args.req.session.customer    = organizer;
		args.req.session.isOrganizer = true;
		args.req.session.organizer   = organizer;
		callback();

		
	    } else {
		args.req.session.isOrganizer = false;
		//else check if they are attending this plan
		var isAttending = false;
		console.log('setcurrentplan: session email != organizer email');
		//if they are not on the friend list send them to the public url
		Customer.findPlansByFriend(args.req.session.customer,function(err,attending) {
		    for (var i in attending) {
			var plan = attending[i];
			if (plan.config.guid == thisPlan.config.guid) {
			    isAttending = true;
			    for (var i2 in plan.friends) {
				var f = plan.friends[i2];
				if ((typeof f.me != "undefined") && f.me) {
				    console.log(plan);
				    args.req.session.friend            = {};
				    args.req.session.friend.email      = f.email;
				    args.req.session.friend.fbId       = f.fbId;
				    args.req.session.friend.last_name  = f.lastName;
				    args.req.session.friend.first_name = f.firstName;
				    args.req.session.friend.token      = f.token;
				    args.req.session.friend.addMethod  = f.addMethod;
				    args.req.session.friend.payment    = f.payment;
				    args.req.session.friend.decision   = f.decision;
				}
			    }
			}
		    }

		    if (isAttending) {
			console.log('isattenting: '+isAttending);
			args.req.session.currentPlan = thisPlan;
			args.req.session.organizer   = organizer;
			callback();
		    } else {
			console.log('isattenting: '+isAttending);
			args.req.session.currentPlan = {};
			delete args.req.session.organizer;

			callback();
		    }
		});
	    }
	    
	};

	Customer.findPlanByGuid(args.guid,handleOrganizer);

    };


};