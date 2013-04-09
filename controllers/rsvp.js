var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Friend      = wembliModel.load('friend'),
    Plan        = wembliModel.load('plan');
var async       = require('async');

module.exports = function(app) {

	app.get('(/partials)?/modals/rsvp-login/?', function(req,res) {
		res.render('partials/modals/rsvp-login',{partial:true,plan:req.session.plan});
	});

	var viewPlan = function(req,res,view) {
		var guid    = req.param('guid');
		var token   = req.param('token');
		var service = req.param('service') || 'wemblimail';
		console.log('rsvp to guid');
		console.log(guid);
		console.log(token);
		console.log(service);

		if (!req.session.loggedIn) {
			console.log('in rsvp controller - not logged in!');
			/* make them login and if they came from twitter or facebook they need to login there too */
			return res.render('rsvp',{guid:guid,token:token,service:service});
		}

		/* keys to the various service ids in the customer obj */
		var getServiceIdFromCustomer = {
			'wemblimail':function(c) {
				return c.email;
			},
			'facebook':function(c) {
				return c.socialProfiles.facebook.id;
			},
			'twitter':function(c) {
				return c.socialProfiles.twitter.id;
			}
		};

		var csid = getServiceIdFromCustomer[service](req.session.customer);
		console.log('customer service id ' + csid);

		Plan.findOne({guid: guid}, function(err, p) {
			if (!p) { return res.redirect('/'); };
			req.session.plan = p;
			console.log('found plan in rsvp');
			console.log(p);

			/* first check if this customer is the plan organizer */
			if (p.organizer === req.session.customer.id) {
					req.session.plan = p;
					req.session.visitor.context = 'organizer';
					console.log('this person is the organizer');
					return res.redirect(view);
			}

			/* not the organizer? check if this person is invited */
			Friend.findOne().where('contactInfo.service').equals(service).where('contactInfo.serviceId').equals(csid).exec(function(err,friend) {
				console.log(err);
				console.log(friend);
				/* if i have a friend then this person is invited */
				if (err) { res.redirect('/'); };

				if (friend !== null) {
					console.log('this person is invited to this plan as a friend');
					friend.rsvp.viewed = parseInt(friend.rsvp.viewed) + 1;
					friend.rsvp.viewedLastDate = new Date();
					friend.customerId = req.session.customer.id;

					return friend.save(function(err, result) {
						req.session.plan = p;
						req.session.visitor.context = 'friend';
						return res.redirect(view);
					});
				}

				console.log('this person is a visitor just give them the public event view');
				/* this person is no friend of the plan */
				req.session.visitor.context = 'visitor';
				return res.redirect('/event/'+p.event.eventId+'/'+p.event.eventName);
			});
		});
	};

	app.get('/partials/rsvp/:guid?/:service?', function(req,res) {
		return viewPlan(req,res,'/partials/plan');
	});

	app.get('/rsvp/:guid?/:service?', function(req,res) {
		return viewPlan(req,res,'/plan');
	});
};
