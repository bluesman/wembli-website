var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Plan = wembliModel.load('plan');
var keen = require('../../lib/wembli/keenio');

module.exports = function(app) {
	app.all("/callback/sendgrid/email", function(req, res) {
		console.log(req.body);
		if (typeof req.body.organizer == "undefined") {
			return res.send(200);
		}

		function updateFriend(cb) {
			/* if its rsvp or pony up - put it in the corresponding friend obj */
			/* find the friend for this friendId and increment a counter for this category[event] */
			if (typeof req.body.friendId !== "undefined") {
				Friend.findById(req.body.friendId, function(err, f) {
					/* no plan in the db */
					if (!f) {
						return res.send(200);
					}

					if (typeof f.email[req.body.category] == "undefined") {
						f.email[req.body.category] = {};
						f.email[req.body.category][req.body.event] = 1;
					} else {
						if (typeof f.email[req.body.category][req.body.event] == "undefined") {
							f.email[req.body.category][req.body.event] = 1;
						} else {
							f.email[req.body.category][req.body.event]++;
						}
					}
					var eventDate = req.body.event + 'LastDate';
					f.email[req.body.category][eventDate] = new Date(req.body.timestamp * 1000).format("m/d/yy h:MM TT Z");
					console.log(f);
					f.markModified('email');
					f.save(function(err) {
						if (err) {
							return cb(err);
						}
						var d = {
							event: req.body.event,
							service: 'wemblimail',
							friendId: req.body.friendId
						}
						keen.addEvent(req.body.category, d, req, res, function(err, result) {
							cb();
						});
					});
				});
			} else {
				cb();
			}
		};

		/*
		 * req.body will have (at a minimum):
		 * event
		 * email
		 * category
		 */

		/*
		 * Email Categories:
		 * signup
		 * forgot-password
		 * welcome
		 * rsvp
		 * pony-up
		 *
		 */

		var collection = 'email';
		var d = req.body;

		/* handle the appropriate event */
		var eventHandlers = {
			/*
			 * additional fields for bounce:
			 * status: 3-digit status code
			 * reason: Bounce reason from MTA
			 * type: Bounce, Blocked or Expired
			 */
			'bounce': function(cb) {
				/* if the email bounces, just log in keenio for now */
				cb();
			},

			/*
			 * additional fields for click:
			 * url: url clicked
			 */
			'click': function(cb) {
				/* log in keenio */
				cb();
			},

			/*
			 * additional fields for deferred:
			 * response: Full response from MTA
			 * attempt: # of attempts
			 */
			'deferred': function(cb) {

				cb();
			},

			/*
			 * additional fields for delivered:
			 * response: Full response from MTA
			 */
			'delivered': function(cb) {
				updateFriend(cb);
			},
			/*
			 * additional fields for dropped:
			 * reason: drop reason
			 */
			'dropped': function(cb) {

				cb();
			},

			/*
			 * additional fields for processed:
			 * N/A
			 */
			'processed': function(cb) {

				cb();
			},
			/*
			 * additional fields for open:
			 *	N/A
			 */
			'open': function(cb) {
				updateFriend(cb);
			},
			/*
			 * additional fields for spamreport:
			 * N/A
			 */
			'spamreport': function(cb) {

				cb();
			},
			/*
			 * additional fields for delivered:
			 * N/A
			 */
			'unsubscribe': function(cb) {

				cb();
			}
		};

		keen.addEvent(collection, d, req, res, function(err, result) {
			eventHandlers[req.body.event](function() {
				return res.send(200);
			})
		});
	});
}
