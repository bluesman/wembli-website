var crypto = require('crypto');
var mailer = require("wembli/sendgrid");
var Facebook = require('facebook-client').FacebookClient;
var redis = require("redis"),
    redisClient = redis.createClient();

var facebook_client = new Facebook(app.settings.fbAppId,app.settings.fbAppSecret,{timeout:10000});


module.exports = function(app) {
    app.all("/friends/invite",function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	}

	//send vote emails to friends
	if (typeof req.session.currentPlan == "undefined") {
	    req.flash('plan-msg','Unable to retrieve event. Please start a new plan.');
	    return res.redirect('/dashboard');
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
	    console.log('sending invitation to: ');
	    console.log(friend.id);
	    
	    //generate a token to identify this friend when they RSVP
	    var friendToken = "";
	    if (typeof req.session.currentPlan.friends[id].token == "undefined") {
		hash = crypto.createHash('md5');
		var friendTimestamp = new Date().getTime().toString();
		hash.update(friend.email+friendTimestamp);
		friendToken = hash.digest(encoding='base64');
		req.session.currentPlan.friends[id].token = {timestamp: friendTimestamp,token: friendToken};
	    } else {
		friendToken = req.session.currentPlan.friends[id].token.token;
	    }

	    console.log('sendInvite is '+req.param('sendInvite'));
	    if (req.param('sendInvite')) {
		var name = 'A friend';
		if ((typeof req.session.customer.first_name != "undefined") && (typeof req.session.customer.last_name != "undefined")) {
		    name = req.session.customer.first_name+' '+req.session.customer.last_name;
		}
		var rsvpLink = "http://"+app.settings.host+".wembli.com/plan/view/"+encodeURIComponent(req.session.currentPlan.config.guid)+"/"+encodeURIComponent(friendToken)+"/collectVote";
		var voteBy = req.param('respondByCheckbox') ? req.param('voteBy') : null;

		var initCollectVote = function() {
		    //flag the eventplan so we know we attempted to send the email
		    req.session.currentPlan.friends[id].collectVote = {initiated:1,initiatedLastDate:new Date().format("m/d/yy h:MM TT Z")};
		};
		var subj = name+' has invited you to go to '+req.session.currentPlan.event.Name;
		
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
			    apiCall = "/me/feed";
			    //post args for fb
			    var msg = name+' is planning an outing and you\'re invited!';
			    var desc = req.user.first_name+', '+name+ ' is using Wembli to plan a '+req.session.currentPlan.event.Name+' outing on '+req.session.currentPlan.event.DisplayDate+' and has invited you! Follow the link so you can RSVP.  You can also contribute to the plan by voting for the options that work best for you.';
			    if (voteBy != null) {
				desc += 'Oh, and '+name+' is asking if you would please respond no later than: '+voteBy;
			    }
			    var params = {
				message:msg,
				link:rsvpLink,
				name:'Click To View Details & RSVP',
				description:desc,
			    };
			    
			    facebook_session.graphCall(apiCall,params,'POST')(function(result) {
				console.log(result);
			    });
			});
			
		    });
		    initCollectVote();
		} else {
		    res.render('email-templates/collect-votes', {
			layout:'email-templates/layout',
			voteByDate:voteBy,
			rsvpLink:rsvpLink,
			friendToken:friendToken
		    },function(err,htmlStr) {
			var mail = {
			    from: '"Wembli Support" <help@wembli.com>',
			    to:friend.email,
			    headers: {
				'X-SMTPAPI': {
				    category : "collectVote",
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
			console.log('sending to '+friend.email);
			mailer.sendMail(mail,function(error, success){
			    console.log('sent mail response:');
			    console.log(error);
			    console.log(success);
			    console.log("Message "+(success?"sent":"failed:"+error));
			});
			
			initCollectVote();
		    });
		}
		req.flash('plan-msg','Successfully sent invitations to invited friends.');
	    }
	}
	req.session.currentPlan.config.voteBy = req.param('voteBy');
	req.session.currentPlan.completed.summary = true;
	req.user.saveCurrentPlan(req.session.currentPlan);

	//redirect to organizer view with flash message
	res.redirect('/plan/view');
    });

}