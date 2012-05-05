var wembliModel   = require('wembli-model'),
    Customer      = wembliModel.load('customer'),
    crypto        = require('crypto'),
    mailer        = require("wembli/sendgrid"),
    uuid          = require('node-uuid'),
    payPal        = require('../lib/wembli/paypal'),
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
		req.flash('error','An error occurred. Please start a new plan.');
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
		console.log(req.session.customer);
		//this is async but we don't need to wait (i don't think)
		req.session.customer.saveCurrentPlan(req.session.currentPlan);
	    }

	    //set the login redirect url
	    req.session.redirectUrl = req.url;
	    req.session.redirectMsg = 'Successfully logged in and saved your work.';

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
	var callback = function() {

	    //they must have a currentPlan to add tix to
	    if (typeof req.session.currentPlan.config == "undefined") {
		req.flash('error','An error occurred. Please start a new plan.');
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
	    req.session.redirectMsg = 'Successfully logged in and saved your work.';

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
	    if (req.session.isOrganizer) {
		
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
	    req.session.redirectMsg = 'Successfully logged in and saved your work.';

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

    app.all('/plan/public/:guid?/:token?/:action?',function(req,res) {
	//get the event details for this guid
	Customer.findPlanByGuid(req.param('guid'),function(err,c) {
	    for (var i in c.eventplan) {
		if (typeof c.eventplan[i] == "undefined") {
		    continue;
		}
		if (typeof c.eventplan[i].config == "undefined") {
		    continuel;
		    ;	}

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
	});
    });

    //organizer or friend view of the currentPlan
    app.all('/plan/view/:guid?/:token?/:action?',function(req,res) {
	//check if fb login
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

	//if they are not logged in, send them to the public view
	if (!req.session.loggedIn) {
	    return res.redirect(publicViewUrl);
	}

	//if they don't have a guid they have to have a current plan
	if (!req.param('guid') && (typeof req.session.currentPlan.config == "undefined")) {
		req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect(publicViewUrl);
	}

	//if there is a guid but they are not logged in and there is no token - gtfo
	if (req.param('guid') && !req.session.loggedIn && !req.param('token')) {
		req.flash('error','The plan you\'re trying to view is by invitation only. Please login to confirm you are invited.');
		return res.redirect(publicViewUrl);
	}	    

	var callback = function() {
	    //they must have a currentPlan to view to
	    if (typeof req.session.currentPlan.config == "undefined") {
		req.flash('error','An error occurred. Please start a new plan.');
		return res.redirect('/');
	    }

	    //if there is a guid but they are not the organizer of this guid then they can't edit
	    //i don't think this can ever happen because if there is a guid - this plan will be the currentPlan
	    /*
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
	    */

	    //set the login redirect url
	    req.session.redirectUrl = req.url;
	    req.session.redirectMsg = 'Successfully logged in and saved your work.';

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
		    token:req.param('token'),
		    cssIncludes: [],
		    jsIncludes: ['/js/friend-view.js']
		});

	    }

	    //render the appropriate view
	    if (req.session.isOrganizer) {
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
		    token:req.param('token'),
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


    app.all('/plan/collect-payment',function(req,res) {
	if (!req.param('ticketChoice')) {
	    req.flash('plan-msg','An error occurred. No ticket choice provided.');
	    return res.redirect('/plan/view');
	}

	//if they don't have a guid they have to have a current plan
	if (!req.param('guid') && (typeof req.session.currentPlan.config == "undefined")) {
	    req.flash('error','An error occurred. Please start a new plan.');
	    return res.redirect('/');
	}
	
	//if there is a guid but they are not logged in and there is no token - gtfo
	if (req.param('guid') && !req.session.loggedIn && !req.param('token')) {
	    req.flash('error','The plan you\'re trying to view is by invitation only. Please login to confirm you are invited.');
	    return res.redirect('/');
	}	    

	//set the appropriate ticket group to have finalChoice = true
	if (typeof req.session.currentPlan.tickets[req.param('ticketChoice')] == "undefined") {
	    req.flash('plan-msg','An error occurred. No ticket choice provided.');
	    return res.redirect('/plan/view');
	} else {	    
	    req.session.currentPlan.tickets[req.param('ticketChoice')].finalChoice = true;
	}
	
	for (id in req.session.currentPlan.friends) {
	    var friend = req.session.currentPlan.friends[id];
	    //don't send email to friends that have declined
	    if (typeof friend.decision != "undefined" && !friend.decision) {
		continue;
	    }

	    //only send	1 email if friendEmailId param
	    //TODO: prevent spammers? only send 3 emails per friend
	    if (req.param('friendEmailId')) {
		var friendEmailId = ((typeof friend.addMethod != "undefined") && (friend.addMethod == 'facebook')) ? friend.id : friend.email.replace(/\W+/g,'-');
		if (req.param('friendEmailId') != friendEmailId) {
		    continue;  
		} 
	    }
	    console.log('sending email to: ');
	    console.log(id);
	    
	    //generate a token to identify this friend when they come back to pay
	    var friendToken = "";
	    if (typeof req.session.currentPlan.friends[id].token == "undefined") {
		hash = crypto.createHash('md5');
		var friendTimestamp = new Date().getTime().toString();
		hash.update(friend.id+friendTimestamp);
		friendToken = hash.digest(encoding='base64');
		req.session.currentPlan.friends[id].token = {timestamp: friendTimestamp,token: friendToken};
	    } else {
		friendToken = req.session.currentPlan.friends[id].token.token;
	    }

	    console.log('sendMessage is '+req.param('sendMessage'));
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
			console.log(facebook_session);
			if (!facebook_session) {
			    return res.redirect('/auth/facebook');
			}
			
			facebook_session.isValid()(function(is_valid) {
			    if (!is_valid) {
				return res.redirect('/auth/facebook');
			    }

			    //make a post for wembli
			    var apiCall = "/"+friend.id+"/feed";
			    apiCall = "/me/feed"; //take this out after testing
			    //post args for fb
			    var msg = 'Hey '+friend.firstName+' thanks for coming to '+req.session.currentPlan.event.Name+'!';
			    var desc = 'I\'ve created a plan for our outing - click the link below to view and make a contribution.';
			    var params = {
				message:msg,
				link:payLink,
				name:'Click To See The Plan',
				description:desc,
			    };
			    
			    facebook_session.graphCall(apiCall,params,'POST')(function(result) {
				console.log(result);
			    });
			});
			
		    });
		    //flag the eventplan so we know we attempted to send the email
		    console.log('setting collect payment');
		    req.session.currentPlan.friends[id].collectPayment = {initiated:1,initiatedLastDate:new Date().format("m/d/yy h:MM TT Z")};

		} else {
		    res.render('email-templates/collect-payment', {
			layout:'email-templates/layout',
			payLink:payLink,
			friendToken:friendToken
		    },function(err,htmlStr) {
			var mail = {
			    from: '"Wembli Support" <help@wembli.com>',
			    to:email,
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
			console.log('sending to '+email);
			mailer.sendMail(mail,function(error, success){
			    console.log('sent mail response:');
			    console.log(error);
			    console.log(success);
			    console.log("Message "+(success?"sent":"failed:"+error));
			});
			
			//flag the eventplan so we know we attempted to send the email
			req.session.currentPlan.friends[id].collectPayment = {initiated:1,initiatedLastDate:new Date().format("m/d/yy h:MM TT Z")};
			
		    });
		}
	    }
	}
	console.log(req.session.currentPlan);
	req.session.currentPlan.completed.voting = true;
	req.session.customer.saveCurrentPlan(req.session.currentPlan);

	//redirect to organizer view with flash message
	req.flash('plan-msg','Successfully sent messages to invited friends.');
	res.redirect('/plan/view');

    });

    app.all('/plan/make-payment/:guid?/:token?',function(req,res) {
	//must be logged in and we need to have their email address


	var amountMethod = req.param('amount'); //did they pay for tickets? or an arbitrary amount?
	var amountQty    = req.param('amountQty'); //only relevant if amountMethod == 'byPerson'
	var arbitraryAmount = req.param('#arbitraryAmount'); //only relevant if amountMethod == 'arbitrary'
	var contribution = req.param('contribution'); //the amount the person wants to pay
	var token = req.param('token'); //token tells us who is making the payment
	var guid = req.param('guid'); //which plan 

	console.log('contribution: '+contribution);

	if (!req.param('contribution')) {
	    req.flash('plan-msg','An error occurred. No ticket choice provided.');
	    return res.redirect('/plan/view/'+guid+'/'+token);
	}

	//if they don't have a guid they have to have a current plan
	if (!req.param('guid') && (typeof req.session.currentPlan.config == "undefined")) {
	    req.flash('error','An error occurred. Please start a new plan.');
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
		console.log(receiverList)
		var params = {token:req.param('token'),
			      guid:req.param('guid'),
			      receiverList:receiverList};
		payPal.Pay(params,function(err,results) {
		    if (err) {
			console.log('ERROR: '+err);
		    } else {
			console.log(results);
			results.contribution = contribution;
			results.initiated = true;
			initiatedLastDate = new Date(results.responseEnvelope.timestamp).format("m/d/yy h:MM TT Z");
			//set the results in the session and mark that this person has paid
			req.session.currentPlan.friends[req.session.friend.id].payment = results;
			//redirect to paypal on success
			req.session.organizer.saveCurrentPlan(req.session.currentPlan,function(err) {
			    if (err) {
				req.flash('plan-msg','An error occurred. No ticket choice provided.');
				return res.redirect('/plan/view/'+guid+'/'+token);
			    }
			    var redirectUrl = payPal.redirectUrl(results.payKey);
			    console.log('redirecting to '+redirectUrl);
			    return res.redirect(redirectUrl);
			});
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


    /*
     * private functions
     *
     */
    function _setFriend(args) {
	var plan = args.req.session.currentPlan;
	//they can't be the organizer if they are the friend
	args.req.session.isOrganizer = false;
	//a friend is viewing the page - find the friend in the currentPlan that has a matching token
	//and store that as session.friend
	for (id in plan.friends) {
	    //if the friend has a token and it matches the token param
	    if ((typeof plan.friends[id].token != "undefined") && (plan.friends[id].token.token == args.req.param('token'))) {
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
		args.req.session.friend.id         = id;
		args.req.session.friend.email      = plan.friends[id].email;
		args.req.session.friend.last_name  = plan.friends[id].lastName;
		args.req.session.friend.first_name = plan.friends[id].firstName;
		args.req.session.friend.token      = plan.friends[id].token;
		return true;
	    }
	}
	return false;
    }


    function _setCurrentPlan(args,callback) {

	var handleOrganizer = function(err,organizer) {
	    console.log(organizer);
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
	    if (typeof args.req.session.currentPlan.config == "undefined") {
		args.req.flash('error','The plan you tried to view does not exist.');
		return args.res.redirect('/');
	    }
	    
	    //if organizer == customer then set isOrganizer
	    if ((typeof args.req.session.customer != "undefined") && (args.req.session.customer.email == organizer.email)) {
		args.req.session.customer = organizer;
		args.req.session.isOrganizer = true;
	    } else {
		args.req.session.isOrganizer = false;;
	    }
	    
	    args.req.session.organizer = organizer;
	    callback();
	};

	Customer.findPlanByGuid(args.guid,handleOrganizer);

    };


};