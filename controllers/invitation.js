var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Plan = wembliModel.load('plan');

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


	var invitationView = function(req, res, view) {
		var viewData = {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			plan: req.session.plan
		}
		if (req.session.loggedIn) {
			/* if they are logged in but have no plan, send them to dashboard */
			if (typeof req.session.plan === "undefined") {
				return res.redirect('/dashboard');
			} else {
				/* let them load the invitation page */
				delete req.session.redirectUrl;
				req.session.loginRedirect = false;
			}
		} else {
			/* not logged in - load the invitation page as a visitor */
			if (typeof req.session.plan === "undefined") {

				return res.redirect('/event/' + req.param('eventId') + '/' + req.param('eventName'));
			} else {

				/* load the invitation for the plan if the plan matches their session and they are organizer */
				if (req.session.visitor.context !== 'organizer') {
					return res.redirect('/event/' + req.param('eventId') + '/' + req.param('eventName'));
				}
				if (req.param('eventId') != req.session.plan.event.eventId) {
					return res.redirect('/event/' + req.param('eventId') + '/' + req.param('eventName'));
				}
			}
		}
		return res.render(view, viewData);
	};

	app.get('/invitation/:eventId/:eventName', function(req, res) {
		invitationView(req, res, 'invitation');
	});

	app.get('/partials/invitation/:eventId/:eventName', function(req, res) {
		invitationView(req, res, 'partials/invitation');
	});

	app.get('/partials/invite-friends-wizard', function(req, res) {
		req.session.redirectUrl = '/invitation';
		req.session.loginRedirect = true;
		return res.render('partials/invite-friends-wizard', {
			partial: true
		});
	});


}
