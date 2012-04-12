var mailer = require("wembli/sendgrid");
var redis = require("redis"),
    redisClient = redis.createClient();

module.exports = function(app) {
    app.all("/friends/invite",function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	}

	var voteByDate = req.param('voteBy');
	console.log(voteByDate);

	//send vote emails to friends
	if (typeof req.session.eventplan == "undefined") {
	    req.flash('error','Unable to retrieve event. Please start a new plan.');
	    return res.redirect('/dashboard');
	}

	console.log('friends: ');
	console.log(req.session.eventplan.friends);
	for (email in req.session.eventplan.friends) {
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

	    var name = 'A friend';
	    if ((typeof req.session.customer.first_name != "undefined") && (typeof req.session.customer.last_name != "undefined")) {
		name = req.session.customer.first_name+' '+req.session.customer.last_name;
	    }
	    var subj = name+' has invited you to go to '+req.session.eventplan.event.Name;
	    
	    res.render('email-templates/collect-votes', {
		layout:'email-templates/layout',
		voteLink: '',
		noLink: '',
		voteByDate:voteByDate,
		subject: subj,
	    },function(err,htmlStr) {
		var mail = {
		    from: '"Wembli Support" <help@wembli.com>',
		    to:email,
		    headers: {
			'X-SMTPAPI': {
			    category : "collectVote",
			    unique_args:{
				guid:req.session.eventplan.config.guid,
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
	    
	    });
	}

	req.session.eventplan.completed.summary = true;
	req.session.customer.eventplan = [req.session.eventplan];
	req.session.customer.markModified('eventplan');
	req.session.customer.save(function(err) {
	    console.log('saved customer');
	});

	//redirect to organizer view with flash message
	req.flash('info','Successfully sent email to invited friends.');
	res.redirect('/plan/view/organizer');
    });

    app.get("/friends/:guid",function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	}

	//get the event for this guid
	for (idx in req.session.customer.eventplan) {
	    var plan = req.session.customer.eventplan[idx];
	    if (plan.config.guid == req.param('guid')) {
		//hack for now - fix this
		req.session.eventplan = plan;
		break;
	    }
	}

	if (typeof req.session.eventplan == "undefined") {
	    req.flash('error','Unable to retrieve event. Please start a new plan.');
	    return res.redirect('/dashboard');
	}

	res.render('friends', {
	    title: 'wembli.com - friends.',
	    page:'friends',
	    globals:globalViewVars,
	    cssIncludes: [],
	    jsIncludes: ['/js/friends.js']
	});
    });

    app.get("/friends",function(req,res) {
	if (typeof req.session.eventplan.event == "undefined") {
	    //redirect to the home page and flash a message
	    req.flash('error','Your session has expired. If you sign up for Wembli, your work can be automatically saved.');
	    return res.redirect('/');
	}

	if (req.param("completed")) {
	    console.log(req.param("completed"));
	    req.session.eventplan.completed[req.param("completed")] = true;
	}

	//if they are logged in save the plan
	if (req.session.loggedIn) {
	    req.session.customer.eventplan = [req.session.eventplan];
	    req.session.customer.markModified('eventplan');
	    req.session.customer.save(function(err) {
		console.log('saved customer');
	    });
	}

	res.render('friends', {
	    event:req.session.eventplan.event,
	    title: 'wembli.com - friends.',
	    page:'friends',
	    globals:globalViewVars,
	    cssIncludes: [],
	    jsIncludes: ['/js/friends.js']
	});

    });
}