var crypto = require('crypto');
var mailer = require("wembli/sendgrid");
var redis = require("redis"),
    redisClient = redis.createClient();

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

	for (email in req.session.currentPlan.friends) {
	    var friend = req.session.currentPlan.friends[email];
	    //don't send email to friends that have declined
	    if (typeof friend.decision != "undefined" && !friend.decision) {
		continue;
	    }
	    //only send	1 email if friendEmailId param
	    //TODO: prevent spammers? only send 3 emails per friend
	    if (req.param('friendEmailId')) {
		var friendEmailId = email.replace(/\W+/g,'-');
		if (req.param('friendEmailId') != friendEmailId) {
		    continue;  
		} 
	    }
	    console.log('sending email to: ');
	    console.log(email);
	    
	    //generate a token to identify this friend when they RSVP
	    var friendToken = "";
	    if (typeof req.session.currentPlan.friends[email].token == "undefined") {
		hash = crypto.createHash('md5');
		var friendTimestamp = new Date().getTime().toString();
		hash.update(req.param('email')+friendTimestamp);
		friendToken = hash.digest(encoding='base64');
		req.session.currentPlan.friends[email].token = {timestamp: friendTimestamp,token: friendToken};
	    } else {
		friendToken = req.session.currentPlan.friends[email].token.token;
	    }

	    console.log('sendEmail is '+req.param('sendEmail'));
	    if (req.param('sendEmail')) {
		var name = 'A friend';
		if ((typeof req.session.customer.first_name != "undefined") && (typeof req.session.customer.last_name != "undefined")) {
		    name = req.session.customer.first_name+' '+req.session.customer.last_name;
		}
		var subj = name+' has invited you to go to '+req.session.currentPlan.event.Name;
		
		var rsvpLink = "http://"+app.settings.host+".wembli.com/plan/view/"+encodeURIComponent(req.session.currentPlan.config.guid)+"/"+encodeURIComponent(friendToken)+"/collectVote";
		res.render('email-templates/collect-votes', {
		    layout:'email-templates/layout',
		    voteByDate:req.param('voteBy'),
		    rsvpLink:rsvpLink,
		    friendToken:friendToken
		},function(err,htmlStr) {
		    var mail = {
			from: '"Wembli Support" <help@wembli.com>',
			to:email,
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
		    console.log('sending to '+email);
		    mailer.sendMail(mail,function(error, success){
			console.log('sent mail response:');
			console.log(error);
			console.log(success);
			console.log("Message "+(success?"sent":"failed:"+error));
		    });
		    
		    //flag the eventplan so we know we attempted to send the email
		    req.session.currentPlan.friends[email].collectVote = {initiated:1,initiatedLastDate:new Date().format("m/d/yy h:MM TT Z")};
		    
		});
	    }
	}
	req.session.currentPlan.config.voteBy = req.param('voteBy');
	req.session.currentPlan.completed.summary = true;
	req.session.customer.saveCurrentPlan(req.session.currentPlan);

	//redirect to organizer view with flash message
	req.flash('plan-msg','Successfully sent email to invited friends.');
	res.redirect('/plan/view');
    });

}