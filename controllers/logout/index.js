module.exports = function(app) {
    app.all('/logout/?', function(req, res) {
	    req.session.loggedIn = false;
	    req.session.fbAuth   = false;
	    //var fbCookie = 'fbs_'+fbAppId;
	    //res.clearCookie(fbCookie);
	    var errors = {};
	    res.render('login', {
		    globals:globalViewVars,
		layoutContainer:true,
		    session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - login to get the best seats.',
		    params: {remember:req.session.remember,email:(req.session.remember ? req.session.customer.email : null)},
		    errors: errors
	    });
	    //return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/login') );		    
	});
};