var mailer = require("wembli/sendgrid");

module.exports = function(app) {
    app.all("/friends/invite",function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	}
	var voteByDate = req.param('voteBy');

	//send vote emails to friends
	if (typeof req.session.eventplan == "undefined") {
	    req.flash('error','Unable to retrieve event. Please start a new plan.');
	    return res.redirect('/dashboard');
	}

	for (email in req.session.eventplan.friends) {
	    console.log(email);
	    
	    res.render('email-templates/collect-votes', {
		layout:'email-templates/layout',
		voteLink: '',
		noLink: '',
	    },function(err,htmlStr) {
		var mail = new mailer.EmailMessage({
		    sender: '"Wembli Support" <help@wembli.com>',
		    to:email
		});
	    
		mail.subject = req.session.customer.first_name+' '+req.session.customer.last_name+' has invited you to go to '+req.session.eventplan.event.Name;

		//templatize this 
		mail.body = '';
		mail.html = htmlStr;
		console.log('sending to '+email);
		mail.send(function(error, success){
		    console.log("Message "+(success?"sent":"failed:"+error));
		});
	    
	    });
	}

	//redirect to organizer view with flash message
	req.flash('info','Successfully sent email to invited friends.');
	res.redirect('/plan/view/organizer');
    });

    app.get("/friends/:eventGuid",function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	}
	//get the event for this guid
	for (idx in req.session.customer.eventplan) {
	    var plan = req.session.customer.eventplan[idx];
	    console.log('plan: ');
	    console.log(plan);
	    if (plan.config.guid == req.param('eventGuid')) {
		req.session.eventplan = plan;
		break;
	    }
	}

	if (typeof req.session.eventplan == "undefined") {
	    req.flash('error','Unable to retrieve event. Please start a new plan.');
	    return res.redirect('/dashboard');
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

    app.get("/friends",function(req,res) {
	if (typeof req.session.eventplan.event == "undefined") {
	    //redirect to the home page and flash a message
	    req.flash('error','Your session has expired. If you sign up for Wembli, your work can be automatically saved.');
	    return res.redirect('/');
	}

	//if they are logged in save the plan
	if (req.session.loggedIn) {
	    req.session.customer.eventplan = [req.session.eventplan];
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