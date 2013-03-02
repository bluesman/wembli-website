var customerRpc = require('../rpc/customer').customer;
var wembliUtils = require('../lib/wembli/utils');
var wembliModel = require('../lib/wembli-model');
var Customer = wembliModel.load('customer');
var Friend = wembliModel.load('friend');
var async = require('async');
var Facebook = require('facebook-client').FacebookClient;
var facebook_client = new Facebook(app.settings.fbAppId, app.settings.fbAppSecret, {
	timeout: 10000
});

exports["invite-friends"] = {

	/* signup */
	"submit-step1": function(args, req, res) {
		var me = this;
		console.log(args);
		/* make sure we have a firstName, lastName and email */
		if (!args.firstName || !args.lastName || !args.email) {
			me(null, {
				success: 1,
				formError: true
			});
		}

		/* few different cases here... */

		if (args.customerId) {
			/* fetch it from the db and potentially update firstName, lastName and/or email */
			var update = {
				firstName: args.firstName,
				lastName: args.lastName,
				email: args.email
			};
			console.log('updating customer:');
			console.log(args);

			Customer.findByIdAndUpdate(args.customerId, update, function(err, c) {
				if (err) {
					return me(err);
				}
				if (c === null) {
					return me('no crystal');
				} /* this should never happen unless there's some sort of funny biz */
				req.session.customer = c;
				me(null, {
					success: 1
				})
			});

		} else {
			/* new customer.  That means req.session.customer does not exist and there is no args.customerId*/
			customerRpc['signup'].apply(function(err, results) {
				/* set the login redirect url if the cust already exists */
				if (results.exists) {
					req.session.loginRedirect = true;
					req.session.redirectUrl = '/invitation';
				}
				console.log('signup results');
				console.log(results);
				me(null, results);
			}, [args, req, res]);
		}
	},

	/* add facebook friends */
	"submit-step2": function(args, req, res) {
		var me = this;
		var data = {
			success: 1,
			formError: false,
		};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			console.log('no customer..back to step 1 please');
			data.noCustomer = true;
			return me(null, data);
		}

		if (typeof args.next !== "undefined") {
			data.next = args.next;
		}

		console.log('step2 args:');
		console.log(args);
		console.log('does plan exist')

		if (typeof args.friend !== "undefined") {
			args.friend.inviteStatus = (args.friend.inviteStatus) ? true : false;
		}
		/*
		step 2 is the first step if they're logged in
		we may or may not already have a saved plan
		*/

		/* set plan.messaging.facebook */
		req.session.plan.messaging.facebook = args.message;
		/* call save with a callback - if this is a new plan it will make an id for me so I can add friends */
		req.session.plan.save(function(err) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to save plan';
				return me(null, data);
			}
			console.log('saved plan - plan id is:' + req.session.plan.id);

			if (typeof args.friend === "undefined") {
				return me(null, data);
			}
			/* add/update the friend */

			var query = {
				'planId': req.session.plan.id,
				'contactInfo.service': 'facebook',
				'contactInfo.serviceId': args.friend.id
			};
			Friend.findOne(query, function(err, friend) {
				if (err) {
					data.success = 0;
					data.dbError = 'unable to find friends';
					return me(null, data);
				}

				if (friend) {
					console.log('updaing existing friend to tatus: ' + args.friend.checked);
					friend.inviteStatus = args.friend.checked;
				} else {
					console.log('adding a new friend');
					var set = {
						planId: req.session.plan.id,
						contactInfo: {
							service: 'facebook',
							serviceId: args.friend.id,
							name: args.friend.name,
							imageUrl: 'https://graph.facebook.com/' + args.friend.id + '/picture'
						},
						inviteStatus: args.friend.inviteStatus
					}
					console.log(set);
					friend = new Friend(set);
				}

				friend.save(function(err) {
					if (err) {
						data.success = 0;
						data.dbError = 'unable to save friend';
						return me(null, data);
					}
					console.log('saved friend: ' + friend.id);
					/* now add the friend to the plan */
					req.session.plan.addFriend(friend, function(err) {
						if (err) {
							data.success = 0;
							data.dbError = 'unable to add friend ' + friend.id;
							return me(null, data);
						}
						console.log('added friend to plan: ' + req.session.plan.guid);
						data.friend = friend;
						return me(null, data);
					});

				});
			});
		});

	},

	"submit-step3": function(args, req, res) {
		var me = this;
		var data = {
			success: 1,
			formError: false,
		};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			console.log('no customer..back to step 1 please');
			data.noCustomer = true;
			return me(null, data);
		}

		if (typeof args.next !== "undefined") {
			data.next = args.next;
		}

		console.log('step2 args:');
		console.log(args);
		console.log('does plan exist')

		if (typeof args.friend !== "undefined") {
			args.friend.inviteStatus = (args.friend.inviteStatus) ? true : false;
		}

		/* set plan.messaging.facebook */
		req.session.plan.messaging.twitter = args.message;
		/* call save with a callback - if this is a new plan it will make an id for me so I can add friends */
		req.session.plan.save(function(err) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to save plan';
				return me(null, data);
			}
			console.log('saved plan - plan id is:' + req.session.plan.id);

			if (typeof args.friend === "undefined") {
				return me(null, data);
			}
			/* add/update the friend */

			var query = {
				'planId': req.session.plan.id,
				'contactInfo.service': 'twitter',
				'contactInfo.serviceId': args.friend.id
			};
			Friend.findOne(query, function(err, friend) {
				if (err) {
					data.success = 0;
					data.dbError = 'unable to find friends';
					return me(null, data);
				}

				if (friend) {
					console.log('updaing existing friend to status: ' + args.friend.checked);
					friend.inviteStatus = args.friend.checked;
				} else {
					console.log('adding a new friend');
					var set = {
						planId: req.session.plan.id,
						contactInfo: {
							service: 'twitter',
							serviceId: args.friend.id,
							name: args.friend.name,
							imageUrl: args.friend.profile_image_url_https,
						},
						inviteStatus: args.friend.inviteStatus
					}
					console.log(set);
					friend = new Friend(set);
				}

				friend.save(function(err) {
					if (err) {
						data.success = 0;
						data.dbError = 'unable to save friend';
						return me(null, data);
					}
					console.log('saved friend: ' + friend.id);
					/* now add the friend to the plan */
					req.session.plan.addFriend(friend, function(err) {
						if (err) {
							data.success = 0;
							data.dbError = 'unable to add friend ' + friend.id;
							return me(null, data);
						}
						console.log('added friend to plan: ' + req.session.plan.guid);
						data.friend = friend;
						return me(null, data);
					});

				});
			});
		});

	},
	"submit-step4": function(args, req, res) {
		var me = this;
		var data = {
			success: 1,
		};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			console.log('no customer..back to step 1 please');
			data.noCustomer = true;
			return me(null, data);
		}

		if (typeof args.next !== "undefined") {
			data.next = args.next;
		}

		console.log('step4 args:');
		console.log(args);
		console.log('does plan exist')

		if (typeof args.friend !== "undefined") {
			args.friend.inviteStatus = (args.friend.inviteStatus) ? true : false;
		}

		/* set plan.messaging.wemblimail */
		req.session.plan.messaging.wemblimail = args.message;

		/* call save with a callback - if this is a new plan it will make an id for me so I can add friends */
		req.session.plan.save(function(err) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to save plan';
				return me(null, data);
			}
			console.log('saved plan - plan id is:' + req.session.plan.id);

			if (typeof args.friend === "undefined") {
				return me(null, data);
			}
			/* add/update the friend */

			var query = {
				'planId': req.session.plan.id,
				'contactInfo.service': 'wemblimail',
				'contactInfo.serviceId': args.friend.id
			};
			Friend.findOne(query, function(err, friend) {
				if (err) {
					data.success = 0;
					data.dbError = 'unable to find friends';
					return me(null, data);
				}

				if (friend) {
					console.log('updaing existing friend to status: ' + args.friend.checked);
					friend.inviteStatus = args.friend.checked;
					friend.contactInfo.name = args.friend.name;
				} else {
					console.log('adding a new friend');
					var set = {
						planId: req.session.plan.id,
						contactInfo: {
							service: 'wemblimail',
							serviceId: args.friend.id,
							name: args.friend.name,
						},
						inviteStatus: args.friend.inviteStatus
					}
					console.log(set);
					friend = new Friend(set);
				}

				friend.save(function(err) {
					if (err) {
						data.success = 0;
						data.dbError = 'unable to save friend';
						return me(null, data);
					}
					console.log('saved friend: ' + friend.id);
					/* now add the friend to the plan */
					req.session.plan.addFriend(friend, function(err) {
						if (err) {
							data.success = 0;
							data.dbError = 'unable to add friend ' + friend.id;
							return me(null, data);
						}
						console.log('added friend to plan: ' + req.session.plan.guid);
						data.friend = friend;
						return me(null, data);
					});
				});
			});
		});
	},
	"send-invitation": function(args, req, res) {
		var me = this;
		var data = {
			success: 1,
		};

		console.log('send-invitation');
		console.log(args);

		var getToken = function(friend) {
			/* generate a token to identify this friend when they RSVP */
			var friendToken = "";
			if (typeof friend.token == "undefined") {
				var friendTimestamp = new Date().getTime().toString();
				var string = friend.contactInfo.service + friend.contactInfo.serviceId + friendTimestamp;
				var friendToken = wembliUtils.md5(string);
				friend.token = {
					timestamp: friendTimestamp,
					token: friendToken
				};
				console.log(friend.token);
			} else {
				friendToken = friend.token.token;
			}
			console.log(friendToken);
			return friendToken;
		};

		var inviteMethods = {
			'facebook': function(friend, callback) {
				console.log('invite via facebook');


				facebook_client.getSessionByAccessToken(req.session.facebook.accessToken)(function(facebook_session) {
					if (!facebook_session) {
						return me(null, {success: 0});
					}

					facebook_session.isValid()(function(is_valid) {
						if (!is_valid) {
							return me(null, {success: 0});
						}

						//make a post for wembli
						var apiCall = "/" + friend.contactInfo.serviceId + "/feed";

						var name = req.session.customer.firstName + ' ' + req.session.customer.lastName;
						var rsvpDate = new Date(args.rsvpDate);
						console.log('rsvp date is: ' + rsvpDate);

						var msg = name + ' is planning an outing and you\'re invited!';

						var rsvpLink = "http://" + app.settings.host + ".wembli.com/rsvp/" + encodeURIComponent(req.session.plan.guid) + "/" + encodeURIComponent(getToken(friend));

						var params = {
							message: msg,
							link: rsvpLink + '/fb',
							name: 'Click To View Details & RSVP',
							description: req.session.plan.messaging.facebook,
						};
						console.log('calling fb: ' + apiCall);
						console.log('with params:');
						console.log(params);
						facebook_session.graphCall(apiCall, params, 'POST')(function(result) {
							friend.rsvp.date = rsvpDate;
							friend.rsvp.initiated = true;
							friend.rsvp.initiatedLastDate = new Date().format("m/d/yy h:MM TT Z");
							return callback();
						});
					});
				});

			},
			'twitter': function(friend, callback) {
				console.log('invite via twitter');
				callback();
			},
			'wemblimail': function(friend, callback) {
				console.log('invite via wemblimail');
				callback();
			}
		};

		var sendInvite = function(friend, callback) {
			inviteMethods[friend.contactInfo.service](friend, callback);
		};

		var finished = function(err) {
			console.log('finished async');

			setTimeout(function() {
				console.log('sennnnd....');
				me(null, data);
			}, 3000);


		};

		/* get the friends for this plan */
		Friend.where('planId').equals(req.session.plan.id).exec(function(err, results) {
			async.forEach(results, sendInvite, finished);
		});

	}

};
