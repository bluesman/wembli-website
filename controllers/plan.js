var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');

module.exports = function(app) {


	var invitationView = function(req,res,view) {
		var viewData = {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			plan: req.session.plan
		}
		if (req.session.loggedIn) {
			delete req.session.redirectUrl;
			req.session.loginRedirect = false;
		} else {
			console.log('setting redirect url:');
			//they're going to get a login overlay if they aren't logged in - set the redirectUrl here
			req.session.redirectUrl = '/invitation';
			req.session.loginRedirect = true;
		}
		console.log(req.session.redirectUrl);
		console.log('render view: '+view);
		return res.render(view,viewData);
	};

	var planView = function(req, res, view) {
		var viewData = {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			plan: req.session.plan
		}

		//TODO - handle this in a more global way
		//if they are logged in then clear out any redirectUrl that may have been set
		if (req.session.loggedIn) {
			delete req.session.redirectUrl;
			req.session.loginRedirect = false;
		} else {
			//they're going to get a login overlay if they aren't logged in - set the redirectUrl here
			req.session.redirectUrl = '/plan';
			req.session.loginRedirect = true;
		}


		/*
		session will dictate what view we display (check out the view files to see this logic)

		a) there is a req.session.plan and the organizer is "undefined"
	     then this is the organizer event dashboard view

	  b) there is a req.session.plan but plan.organizer is set
	     then this is a plan someone else is organizing

	  c) there is no req.session.plan
	     then display no-event
	  */

		return res.render(view,viewData);
	};

	app.get('/plan', function(req,res) { planView(req, res, 'plan'); });
	app.get('/partials/plan', function(req, res) { planView(req, res, 'partials/plan'); });

	app.get('/plan/:guid', function(req,res) {
		Plan.findOne({guid: req.param('guid')}, function(err, p) {
			if (!p) { return res.redirect('/'); };
			req.session.plan = p;
			res.redirect('/plan');
		});
	});

	app.get(/^\/partials\/plan\/(nav|dashboard|feed)$/, function(req,res) {
		return res.render('partials/plan/'+req.session.visitor.context+'-'+req.url.split('/')[3],{partial:true});
	});

	app.get('/partials/plan/:guid', function(req, res) {
		Plan.findOne({guid: req.param('guid')}, function(err, p) {
			if (!p) { return res.redirect('/'); };
			req.session.plan = p;
			res.redirect('/partials/plan');
		});
	});

	app.get('/invitation', function(req,res) { invitationView(req, res, 'plan'); });
	app.get('/partials/invitation', function(req,res) { invitationView(req, res, 'partials/plan'); });

	app.get('/partials/invite-friends-wizard', function(req, res) {
		req.session.redirectUrl = '/invitation';
		req.session.loginRedirect = true;
		return res.render('partials/invite-friends-wizard',{partial:true});
	});


}
