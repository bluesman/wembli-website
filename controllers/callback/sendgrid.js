var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Plan = wembliModel.load('plan');
var Friend = wembliModel.load('friend');
var keen = require('../../lib/wembli/keenio');

module.exports = function(app) {
	app.all("/callback/sendgrid/email", function(req, res) {
		console.log('sendgrid callback body:');
		console.log(req.body);

		function updateFriend(cb) {
			console.log('updating friend');
			/* if its rsvp or pony up - put it in the corresponding friend obj */
			/* find the friend for this friendId and increment a counter for this category[event] */
			if (typeof req.body.friendId !== "undefined") {
				Friend.findById(req.body.friendId, function(err, f) {
					console.log('find friend for friendId:' + req.body.friendId);
					console.log(err);
					console.log(f);
					/* no plan in the db */
					if (!f) {
						console.log('no friend!');
						return cb();
					}
					console.log('here');
					if (typeof f.email[req.body.category] == "undefined") {
						console.log('here');
						f.email[req.body.category] = {};
						f.email[req.body.category][req.body.event] = 1;
					} else {
						console.log('hereelse');
						if (typeof f.email[req.body.category][req.body.event] == "undefined") {
							f.email[req.body.category][req.body.event] = 1;
						} else {
							f.email[req.body.category][req.body.event]++;
						}
					}
					var eventDate = req.body.event + 'LastDate';
					console.log('here after if');

					f.email[req.body.category][eventDate] = new Date(req.body.timestamp * 1000);
					console.log(f);
					f.markModified('email');

					var save = function(f) {
					    console.log('calling save friend');
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
					};

					/* any special instructions for this friend */
					if ((typeof updateFriendHooks[req.body.category] !== "undefined") && (typeof updateFriendHooks[req.body.category][req.body.event] !== "undefined")) {
					    console.log('calling hook');
						updateFriendHooks[req.body.category][req.body.event](f, save);
					} else {
					    console.log('calling save');
						save(f);
					}


				});
			} else {
				console.log('no friend id - im outa here');
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
				console.log('click happened');
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
				console.log('open happened');
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

		var updateFriendHooks = {
			'pony-up-request': {
				'delivered': function(f, save) {
				    console.log('calling pony-up-request delivered hook');
					if (req.body.paymentId) {
						var p = f.payment.id(req.body.paymentId);
						console.log('payment object:');
						console.log(p);
						if (typeof p.email === "undefined") {
						    p.email = {};
						}
						p.email['delivered'] = req.body;
						p.status = 'delivered';
						console.log('payment: ');
						console.log(p);
						//p.save(function(err) {
						save(f);
						//});
					}
				},
				'open': function(f, save) {
					if (req.body.paymentId) {
						var p = f.payment.id(req.body.paymentId);
						if (typeof p.email === "undefined") {
						    p.email = {};
						}
						p.email['opened'] = req.body;
						p.status = 'opened';
						console.log('payment: ');
						console.log(p);
						//p.save(function(err) {
						save(f);
						//});
					}
				}
			}
		};


		console.log('add event in keen');
		keen.addEvent(collection, d, req, res, function(err, result) {
			console.log('keenio addevent:');
			console.log(err);
			console.log(result);
			eventHandlers[req.body.event](function() {
				console.log('returning 200');
				return res.send(200);
			});
		});
	});
}
