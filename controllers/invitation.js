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
		    console.log('they are logged in');
		    /* if they are logged in but have no plan, send them to dashboard */
		    if (typeof req.session.plan === "undefined") {
			return res.redirect('/dashboard');
		    } else {
			console.log('they have a plan');
			console.log(req.session.plan);
			/* let them load the invitation page */
			delete req.session.redirectUrl;
			req.session.loginRedirect = false;
		    }
		} else {
		    /* not logged in - load the invitation page as a visitor */
		    return res.redirect('/event/'+req.param('eventId')+'/'+req.param('eventName'));
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
