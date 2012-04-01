module.exports = function(app) {
    app.get("/friends/:eventGuid",function(req,res) {
	if (!req.session.loggedIn) {	
	    return res.redirect('/login?redirectUrl='+req.url);
	}
	//get the event for this guid
	for (idx in req.session.customer.eventplan) {
	    var plan = req.session.customer.eventplan[idx];
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