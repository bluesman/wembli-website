var async = require('async');
var crypto = require('crypto');
var mailer = require("wembli/sendgrid");
var Facebook = require('facebook-client').FacebookClient;
var redis = require("redis"),
    redisClient = redis.createClient();

var facebook_client = new Facebook(app.settings.fbAppId,app.settings.fbAppSecret,{timeout:10000});


module.exports = function(app) {
    app.all("/friends/invite",function(req,res) {
	console.log('called friend invite');
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	}

	//send vote emails to friends
	if (typeof req.session.currentPlan == "undefined") {
	    req.flash('plan-msg','Unable to retrieve event. Please start a new plan.');
	    return res.redirect('/dashboard');
	}

	//you can only resend to a single email
	//this allows us to handle the case where they are adding more friends to an existing plan
	//for bulk friend emails, we will send only to those emails that have not had emails sent
	var resendOk = req.param('friendEmailId') ? true : false;
	console.log('resendok:'+resendOk);
	console.log('resendto: '+req.param('friendEmailId'));

	var sendInvite = function(friend,callback) {
	    //don't send email to friends that have declined
	    if (typeof friend.decision != "undefined" && !friend.decision) {
		console.log('they declined');
		return callback();
	    }

	    //if resendOk is false, make sure this friend has never had a collectVote email sent yet
	    if (!resendOk) {
		if ((typeof friend.collectVote != "undefined") && (friend.collectVote.initiated)) {
		    console.log('skipping this friend because resendok is false and they already got a collectVote email');
		    return callback();
		}
	    }

	    //only send	1 email if friendEmailId param
	    //TODO: prevent spammers? only send 3 emails per friend
	    if (req.param('friendEmailId')) {
		var friendEmailId = ((typeof friend.addMethod != "undefined") && (friend.addMethod == 'facebook')) ? friend.fbId : friend.email;
		console.log('friend email id: '+friendEmailId);
		if (req.param('friendEmailId') != friendEmailId) {
		    console.log('skipping because: '+req.param('friendEmailId')+' != '+friendEmailId);
		    return callback();
		} 
	    }
	    console.log('sending invitation to: ');
	    console.log(friendEmailId);
	    
	    //generate a token to identify this friend when they RSVP
	    var friendToken = "";
	    if (typeof friend.token == "undefined") {
		hash = crypto.createHash('md5');
		var friendTimestamp = new Date().getTime().toString();
		hash.update(friend.email+friendTimestamp);
		friendToken = hash.digest(encoding='base64');
		friendToken = friendToken.replace(/\//g,'');	    
		
		friend.token = {timestamp: friendTimestamp,token: friendToken};
	    } else {
		friendToken = friend.token.token;
	    }

	    console.log('sendInvite is '+req.param('sendInvite'));
	    if (req.param('sendInvite') == 'on') {
		var name = 'A friend';
		if ((typeof req.session.customer.first_name != "undefined") && (typeof req.session.customer.last_name != "undefined")) {
		    name = req.session.customer.first_name+' '+req.session.customer.last_name;
		}
		var rsvpLink = "http://"+app.settings.host+".wembli.com/plan/view/"+encodeURIComponent(req.session.currentPlan.config.guid)+"/"+encodeURIComponent(friendToken)+"/collectVote";
		var voteBy = req.param('respondByCheckbox') ? req.param('voteBy') : null;

		var initCollectVote = function() {
		    //flag the eventplan so we know we attempted to send the email
		    friend.collectVote = {initiated:1,initiatedLastDate:new Date().format("m/d/yy h:MM TT Z")};
		};
		var subj = name+' has invited you to go to '+req.session.currentPlan.event.Name;
		
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
			    //apiCall = "/me/feed";
			    //post args for fb
			    var msg = name+' is planning an outing and you\'re invited!';
			    var desc = friend.firstName+', '+name+ ' is using Wembli to plan a '+req.session.currentPlan.event.Name+' outing on '+req.session.currentPlan.event.DisplayDate+' and has invited you! Follow the link so you can RSVP.  You can also contribute to the plan by voting for the options that work best for you. ';
			    if (voteBy != null) {
				desc += 'Oh, and '+req.session.customer.first_name+' is asking if you would please respond no later than: '+voteBy;
			    }
			    var params = {
				message:msg,
				link:rsvpLink+'/fb',
				name:'Click To View Details & RSVP',
				description:desc,
			    };
			    console.log('calling fb: '+apiCall);
			    console.log('with params:' );
			    console.log(params);
			    facebook_session.graphCall(apiCall,params,'POST')(function(result) {
				initCollectVote();
				return callback();
			    });
			});
		    });

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
			return callback();
		    });
		}
		//req.flash('plan-msg','Successfully sent invitations to invited friends.');
	    } else {
		callback();
	    }
	};

	var finished = function(err) {
	    if (!err) {
		req.session.currentPlan.config.voteBy = req.param('voteBy');
		req.session.currentPlan.completed.summary = true;
		req.session.customer.saveCurrentPlan(req.session.currentPlan);
	    } else {
		console.log(err);
	    }
	    //redirect to organizer view with flash message
	    res.redirect('/plan/view');
	}

	async.forEach(req.session.currentPlan.friends,sendInvite,finished);

    });

}