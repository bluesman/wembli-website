var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');

module.exports = function(app) {

	var initPlanView = function(req, res, callback) {

		var locals = {
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
		callback(req,res,locals)
	};

	app.get('/plan', function(req,res) {
		/* if there's no event send to the no event page */
		if ((typeof req.session.plan == "undefined") || (typeof req.session.plan.event.eventId === "undefined")) {
			return res.render('no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}

		initPlanView(req, res, function(req, res, locals) {
			res.render('plan',locals);
		});
	});

	app.get('/partials/plan', function(req, res) {
		/* if there's no event send to the no event page */
		if ((typeof req.session.plan == "undefined") || (typeof req.session.plan.event.eventId === "undefined")) {
			return res.render('partials/no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}

		initPlanView(req, res, function(req,res,locals) {
			res.render('partials/plan',locals);
		});
	});

	app.get(/^\/partials\/modals\/organizer-dashboard$/, function(req,res) {
		return res.render('partials/modals/organizer-dashboard',{partial:true});
	});

	app.get(/^\/partials\/plan\/chatter$/, function(req,res) {
		return res.render('partials/plan/chatter',{partial:true});
	});

	app.get(/^\/partials\/plan\/(nav|dashboard|feed)$/, function(req,res) {
		return res.render('partials/plan/'+req.session.visitor.context+'-'+req.url.split('/')[3],{partial:true});
	});

	/* does this ever get called? */
	app.get('/plan/:guid', function(req,res) {
		Plan.findOne({guid: req.param('guid')}, function(err, p) {
			if (!p) { return res.redirect('/'); };
			req.session.plan = p;
			res.redirect('/plan');
		});
	});

	app.get('/partials/plan/:guid', function(req, res) {
		Plan.findOne({guid: req.param('guid')}, function(err, p) {
			if (!p) { return res.redirect('/'); };
			req.session.plan = p;
			res.redirect('/partials/plan');
		});
	});

}
