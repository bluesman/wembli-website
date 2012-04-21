module.exports = function(app) {
    app.all('/logout/?', function(req, res) {
	req.session.loggedIn = false;
	req.session.fbAuth   = false;
	delete req.session.currentPlan;
	delete req.session.customer;
	//var fbCookie = 'fbs_'+fbAppId;
	//res.clearCookie(fbCookie);
	var errors = {};
	res.render('index', {
	    page:'index',
	    layoutContainer: true,
	    globals:globalViewVars,
	    layoutContainer:true,
	    session: req.session,
	    cssIncludes: [],
	    jsIncludes: [],
	    events:[],
	    title: 'wembli.com - login to get the best seats.',
	    params: {remember:req.session.remember,email:(req.session.remember ? req.session.customer.email : null)},
	    errors: errors
	});
	//return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/login') );		    
    });
};