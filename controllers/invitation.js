var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Plan = wembliModel.load('plan');
var planRpc = require('../rpc/plan').plan;
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
			plan: req.session.plan,
			jsIncludes: ['/js/invitation.min.js']
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

	app.get('/invitation/:eventName', function(req, res) {
		var viewData = {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			plan: req.session.plan,
			jsIncludes: ['/js/invitation.min.js']
		}

		/* check for a plan in the session */
		if (typeof req.session.plan == "undefined" || (req.session.plan.event.eventId !== eventId)) {
			var args = {
				'eventName': req.param('eventName'),
				'payment': 'split-after'
			};

			planRpc['startPlan'].apply(function(err, results) {
				if (!results.success) {
					console.log('sending 404');
					return res.send('404: Page not Found', 404);
				}
				res.render('invitation',viewData);
			}, [args, req, res]);
		} else {
			res.render('invitation',viewData);
		}

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
