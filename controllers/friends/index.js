module.exports = function(app) {
    app.get("/friends",function(req,res) {
	if (typeof req.session.eventplan.event == "undefined") {
	    //redirect to the home page and flash a message
	    req.flash('error','Your session has expired. If you sign up for Wembli, your work can be automatically saved.');
	    return res.redirect('/');
	}

	res.render('friends', {
	    event:req.session.eventplan.event,
            session:req.session,
	    title: 'wembli.com - friends.',
	    page:'friends',
	    globals:globalViewVars,
	    cssIncludes: [],
            jsIncludes: ['/js/friends.js']
	});

    });
}