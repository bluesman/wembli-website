var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Friend = wembliModel.load('friend'),
	Plan = wembliModel.load('plan');
var async = require('async');

module.exports = function(app) {

	app.get('(/partials)?/modals/rsvp-login/?', function(req, res) {
		res.render('partials/modals/rsvp-login', {
			partial: true,
			plan: req.session.plan
		});
	});

	var viewPlan = function(req, res, view) {
		var guid = req.param('guid');
		var token = req.param('token');
		var service = req.param('service') || 'wemblimail';
		console.log('rsvp to guid');
		console.log(guid);
		console.log(service);


		Friend.findOne().where('rsvp.token').equals(token).where('planGuid').equals(guid).exec(function(err, friend) {
			console.log(err);
			console.log(friend);
			/* if i have a friend then this person is invited */
			if (err) {
				res.redirect('/');
			};

			if (friend === null) {
				/* this person is no friend of the plan */
				req.session.visitor.context = 'visitor';
				var eventView = /partials/.test(view) ? '/partials/event/' + p.event.eventId + '/' + p.event.eventName : '/event/' + p.event.eventId + '/' + p.event.eventName;
				return res.redirect(eventView);
			}

			Plan.findOne({
				guid: guid
			}, function(err, p) {
				if (!p) {
					return res.redirect('/');
				};
				console.log('found plan in rsvp');
				console.log(p);


				var locals = {
					token: token,
					guid: guid,
					service: service,
					confirmSocial: false,
					plan: p,
					friend: friend
				};

				/* if they are not logged in ask them to log in :) */
				if (!req.session.loggedIn) {
					console.log('in rsvp controller - not logged in!');
					/* make them login and if they came from twitter or facebook they need to login there too */
					return res.render('rsvp', locals);
				}

				/* is this customer the plan organizer? */
				if (p.organizer === req.session.customer.id) {
					req.session.plan = p;
					req.session.visitor.context = 'organizer';
					console.log('this person is the organizer');
					return res.redirect(view);
				}


				/* keys to the various service ids in the customer obj */
				var getServiceIdFromCustomer = {
					'wemblimail': function(c) {
						return c.email;
					},
					'facebook': function(c) {
						if (typeof c.socialProfiles === "undefined") {
							return;
						}
						if (typeof c.socialProfiles.facebook === "undefined") {
							return;
						}
						return c.socialProfiles.facebook.id;
					},
					'twitter': function(c) {
						if (typeof c.socialProfiles === "undefined") {
							return;
						}
						if (typeof c.socialProfiles.twitter === "undefined") {
							return;
						}
						return c.socialProfiles.twitter.id;
					}
				};

				console.log('in rsvp customer is: ');
				console.log(req.session.customer);
				var csid = getServiceIdFromCustomer[service](req.session.customer);

				if (typeof csid === "undefined") {
					console.log('need to confirm social for service: ' + service);
					locals.confirmSocial = true;
					return res.render('rsvp', locals);
				}

				console.log('customer service id ' + csid);
				console.log(friend.contactInfo.serviceId);
				console.log('cistomer service: '+service);
				console.log(friend.contactInfo.service);
				/* check to see if the logged in customer is also the invited friend */
				if ((friend.contactInfo.service === service) && (friend.contactInfo.serviceId == csid)) {
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
				var eventView = /partials/.test(view) ? '/partials/event/' + p.event.eventId + '/' + p.event.eventName : '/event/' + p.event.eventId + '/' + p.event.eventName;
				return res.redirect(eventView);
			});
		});
	};

	app.get('/partials/rsvp/:guid/:token/:service', function(req, res) {
		return viewPlan(req, res, '/partials/plan');
	});

	app.get('/rsvp/:guid/:token/:service', function(req, res) {
		return viewPlan(req, res, '/plan');
	});
};
