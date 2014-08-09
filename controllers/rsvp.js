var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer'),
	Friend = wembliModel.load('friend'),
	Plan = wembliModel.load('plan');
var async = require('async');

module.exports = function(app) {

	app.get('/rsvp/:guid/:token/:service', function(req, res) {
		var guid = req.param('guid');
		var token = req.param('token');
		var service = req.param('service') || 'wemblimail';

		/* get the friend for this token */
		Friend.findOne().where('rsvp.token').equals(token).where('planGuid').equals(guid).exec(function(err, friend) {
			console.log('friend that should be rsvping');
			console.log(friend);
			/* if i have a friend then this person is invited */
			if (err) {
				res.redirect('/');
			};

			/* get the plan for this guid */
			Plan.findOne({
				guid: guid
			}, function(err, p) {
				if (!p) {
					return res.redirect('/');
				};

				if (friend === null) {
					req.syslog.notice('friend is null');
					/* this person is no friend of the plan */
					req.session.visitor.context = 'visitor';
					var eventView = '/tickets/' + p.event.eventId + '/' + p.event.eventName;
					req.syslog.notice('redirect to '+eventView);
					return res.redirect(eventView);
				}

				var l = {
					token: token,
					guid: guid,
					service: service,
					confirmSocial: false,
					plan: p,
					friend: friend,
					jsIncludes: ['/js/login.min.js']
				};

				/* if they are not logged in ask them to log in :) */
				if (!req.session.loggedIn) {
					req.syslog.notice('NOT LOGGED IN FOR RSVP');
					console.log('not logged in');
					/* make them login and if they came from twitter or facebook they need to login there too */
					return res.render('rsvp', l);
				}

				/* is this customer the plan organizer? */
				if (p.organizer.customerId === req.session.customer.id) {
					console.log(req.session.customer);
					console.log(p.organizer);
					req.session.plan = p;
					req.session.visitor.context = 'organizer';
					req.syslog.notice('customer is the organizer: ');
					var planView = '/plan/' + p.event.eventId + '/' + p.event.eventName;
					return res.redirect(planView);
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

				var csid = getServiceIdFromCustomer[service](req.session.customer);

				if (typeof csid === "undefined") {
					console.log('no csid render rsvp');
					l.confirmSocial = true;
					return res.render('rsvp', l);
				}

				/* check to see if the logged in customer is also the invited friend */
				if ((friend.contactInfo.service === service) && (friend.contactInfo.serviceId == csid)) {
					friend.rsvp.viewed = parseInt(friend.rsvp.viewed) + 1;
					friend.rsvp.viewedLastDate = new Date();
					friend.customerId = req.session.customer.id;
					req.syslog.notice('this person is a friend that is invited');
					return friend.save(function(err, result) {
						req.session.plan = p;
						req.session.visitor.context = 'friend';

						/*
							and if this customer is not confirmed we can confirm them because we know they signed up
							with the email address that the organizer specified
						*/
						var planView = '/plan/' + p.guid;
						if (req.session.customer.confirmed) {
							return res.redirect(planView);
						} else {
							req.session.customer.confirmed = true;
							req.session.customer.save(function(err) {
								return res.redirect(planView);
							});
						}
					});
				}

				/* this person is no friend of the plan */
				req.session.visitor.context = 'visitor';
				var eventView = '/tickets/' + p.event.eventId + '/' + p.event.eventName;
				req.syslog.notice('this person is not invited send them to: '+eventView);
				return res.redirect(eventView);
			});
		});
	});




	/* old here */

	app.get('(/partials)?/modals/rsvp-login/?', function(req, res) {

		res.render('partials/modals/rsvp-login', {
			partial: true,
			plan: req.session.plan
		});
	});

	var viewPlan = function(req, res, view) {

	};

	app.get('/partials/rsvp/:guid/:token/:service', function(req, res) {
		return viewPlan(req, res, '/partials/plan');
	});

};
