var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');

module.exports = function(app) {

	/* invite wiziard urls */
	app.get('/invitation', function(req, res) {
		res.render('no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});

	app.get('/partials/invitation', function(req, res) {
		res.render('partials/no-event', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});


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

	app.get('/invitation/:eventId/:eventName', function(req,res) { invitationView(req, res, 'plan'); });
	app.get('/partials/invitation/:eventId/:eventName', function(req,res) { invitationView(req, res, 'partials/plan'); });

	app.get('/partials/invite-friends-wizard', function(req, res) {
		req.session.redirectUrl = '/invitation';
		req.session.loginRedirect = true;
		return res.render('partials/invite-friends-wizard',{partial:true});
	});


}
