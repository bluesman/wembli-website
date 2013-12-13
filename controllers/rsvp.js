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

		/* get the friend for this token */
		Friend.findOne().where('rsvp.token').equals(token).where('planGuid').equals(guid).exec(function(err, friend) {
			req.syslog.notice('found friend');
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
					var eventView = /partials/.test(view) ? '/partials/event/' + p.event.eventId + '/' + p.event.eventName : '/event/' + p.event.eventId + '/' + p.event.eventName;
					req.syslog.notice('redirect to '+eventView);
					return res.redirect(eventView);
				}

				var l = {
					token: token,
					guid: guid,
					service: service,
					confirmSocial: false,
					plan: p,
					friend: friend
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
					req.session.plan = p;
					req.session.visitor.context = 'organizer';
					req.syslog.notice('customer is the organizer: '+view);
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
						if (req.session.customer.confirmed) {
							return res.redirect(view);
						} else {
							req.session.customer.confirmed = true;
							req.session.customer.save(function(err) {
								return res.redirect(view);
							});
						}
					});
				}

				/* this person is no friend of the plan */
				req.session.visitor.context = 'visitor';
				var eventView = /partials/.test(view) ? '/partials/event/' + p.event.eventId + '/' + p.event.eventName : '/event/' + p.event.eventId + '/' + p.event.eventName;
				req.syslog.notice('this person is not invited send them to: '+eventView);
				return res.redirect(eventView);
			});
		});
	};

	app.get('/partials/rsvp/:guid/:token/:service', function(req, res) {
		return viewPlan(req, res, '/partials/plan');
	});

	app.get('/rsvp/:guid/:token/:service', function(req, res) {
		req.syslog.notice('WTF');
		return viewPlan(req, res, '/plan');
	});
};
