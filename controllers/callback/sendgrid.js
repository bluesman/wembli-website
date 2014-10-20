var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Plan = wembliModel.load('plan');
var Friend = wembliModel.load('friend');
var keen = require('../../lib/wembli/keenio');
var async = require('async');

module.exports = function(req, res, next) {

  var me = this, contentType = req.headers['content-type'] || '';
  if(req.method === 'POST' && contentType.indexOf('application/json') >= 0) {
  	var payload = req.body;
	console.log(payload);
  	if (Array.isArray(payload)) {
	    async.forEach(payload, function(item, cb) {
		    handle(req, res, item, cb);
		    
		}, function(err) {
		    console.log('finished');
		    if (err) {
			console.log('not a valid sendgrid request...next');
			return next();
		    } else {
			console.log('return 200');
			res.status(200).send('OK');
			
		    }
		});
  	} else {
	    next();
  	}
  } else {
      next();
  }
  
  function handle(req, res, payload, nextItem) {

		function updateFriend(cb) {
			/* if its rsvp or pony up - put it in the corresponding friend obj */
			/* find the friend for this friendId and increment a counter for this category[event] */
			if (typeof payload.friendId !== "undefined") {
				Friend.findById(payload.friendId, function(err, f) {

					/* no plan in the db */
					if (!f) {
						return cb();
					}
					if (typeof f.email[payload.category] == "undefined") {
						f.email[payload.category] = {};
						f.email[payload.category][payload.event] = 1;
					} else {
						if (typeof f.email[payload.category][payload.event] == "undefined") {
							f.email[payload.category][payload.event] = 1;
						} else {
							f.email[payload.category][payload.event]++;
						}
					}
					var eventDate = payload.event + 'LastDate';

					f.email[payload.category][eventDate] = new Date(payload.timestamp * 1000);
					f.markModified('email');

					var save = function(f) {
						f.save(function(err) {
							if (err) {
								return cb(err);
							}
							var d = {
								event: payload.event,
								service: 'wemblimail',
								friendId: payload.friendId
							}
							keen.addEvent(payload.category, d, req, res, function(err, result) {
								cb();
							});
						});
					};

					/* any special instructions for this friend */
					if ((typeof updateFriendHooks[payload.category] !== "undefined") && (typeof updateFriendHooks[payload.category][payload.event] !== "undefined")) {
						updateFriendHooks[payload.category][payload.event](f, save);
					} else {
						save(f);
					}


				});
			} else {
				cb();
			}
		};

		/*
		 * payload will have (at a minimum):
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
		var d = payload;

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

		var updateFriendHooks = {
			'pony-up-request': {
				'delivered': function(f, save) {
					if (payload.paymentId) {
						var p = f.payment.id(payload.paymentId);
						if (typeof p.email === "undefined") {
						    p.email = {};
						}
						p.email['delivered'] = payload;
						p.status = 'delivered';

						//p.save(function(err) {
						save(f);
						//});
					}
				},
				'open': function(f, save) {
					if (payload.paymentId) {
						var p = f.payment.id(payload.paymentId);
						if (typeof p.email === "undefined") {
						    p.email = {};
						}
						p.email['opened'] = payload;
						p.status = 'opened';

						//p.save(function(err) {
						save(f);
						//});
					}
				}
			}
		};

		if (typeof eventHandlers[payload.event] === "undefined") {
			console.log('event doesnt exist');
			return nextItem('event does not exist');
		}

		eventHandlers[payload.event](function() {
			//can't get this to work i dunno why
			//keen.addEvent(collection, d, req, res, function(err, result) {
				nextItem();
			//});
		});
	};
}
