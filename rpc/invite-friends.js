var customerRpc = require('../rpc/customer').customer;
var planRpc = require('../rpc/plan').plan;
var wembliUtils = require('../lib/wembli/utils');
var wembliModel = require('../lib/wembli-model');
var wembliEmail = require('wembli/email');
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
		if (args.password) {
			customerRpc['login'].apply(function(err, results) {
				/* set the login redirect url if the cust already exists */
				console.log('login results');
				console.log(results);
				if (results.error) {
					results.formError = true;
					results.exists = true;
				}
				return me(null, results);
			}, [args, req, res]);
		} else {

			if (args.customerId) {
				/* fetch it from the db and potentially update firstName, lastName and/or email */
				console.log('updating customer:');
				console.log(args);

				Customer.findById(args.customerId, function(err, c) {
					if (err) {
						return me(err);
					}

					/* this should never happen unless there's some sort of funny biz */
					if (c === null) {
						return me('no crystal');
					}

					/* ok got our cust from the db check if email is changing, if so - they need to reconfirm */
					if (c.email !== args.email) {
						var confirmationTimestamp = new Date().getTime().toString();
						var digestKey = args.email + confirmationTimestamp;
						var confirmationToken = wembliUtils.digest(digestKey);

						c.confirmation.pop();
						c.confirmation.unshift({
							timestamp: confirmationTimestamp,
							token: confirmationToken
						});

						c.confirmed = false;
					}

					c.firstName = args.firstName;
					c.lastName = args.lastName;
					c.email = args.email;
					console.log('customer');
					console.log(c);
					c.save(function(err) {
						if (err) {
							return me(err);
						}

						if (confirmationToken) {
							/* send signup email async */
							wembliEmail.sendSignupEmail({
								res: res,
								confirmationToken: confirmationToken,
								customer: c
							});
						}

						req.session.customer = c;
						me(null, {
							success: 1
						});

					});
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
		}
	},

	/* save rsvp date */
	"submit-step2": function(args, req, res) {
		var me = this;
		var data = {
			success: 1,
		};

		/* must have a customer to send invite */
		if (!req.session.customer) {
			console.log('no customer..back to step 1 please');
			data.noCustomer = true;
			return me(null, data);
		}

		console.log('saving rsvp date');
		console.log(args);

		if (typeof args.next !== "undefined") {
			data.next = args.next;
		}

		req.session.plan.rsvpDate = args.rsvpDate;
		/* call save with a callback - if this is a new plan it will make an id for me so I can add friends */
		req.session.plan.save(function(err) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to save plan';
				return me(null, data);
			}
			console.log('saved rsvp date for plan - plan id is:' + req.session.plan.id);
			return me(null, data);
		});
	},

	/* send wemblimail */
	"submit-step5": function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		console.log('step5 args:');
		console.log(args);

		var rpcArgs = {
			service: args.service,
			serviceId: args.serviceId,
			imageUrl: args.imageUrl,
			name: args.name,
			inviteStatus: args.inviteStatus
		};

		planRpc['addFriend'].apply(function(err, results) {
			/* must have a customer to create a plan in the db */
			if (!req.session.customer) {
				console.log('no customer..back to step 1 please');
				data.noCustomer = true;
				return me(null, data);
			}

			console.log('added friend to plan');
			console.log(results.friend);

			/* now that we have added the friend to the plan and have a token, send the wembli email */
			var rsvpLink = "http://tom.wembli.com/rsvp/" + req.session.plan.guid + "/" + results.friend.inviteStatusConfirmation.token;
			wembliEmail.sendRSVPEmail({
				res: res,
				req: req,
				rsvpDate: results.friend.rsvp.date,
				rsvpLink: rsvpLink,
				email: results.friend.contactInfo.serviceId,
				message: args.message
			});

			/* once the email is sent, we can update inviteStatus to true */
			/* got a friend, set inviteStatus to true */
			results.friend.inviteStatus = true;
			/* clear out the token it is no longer valid - so nothing fishy can happen */
			results.friend.inviteStatusConfirmation = {
				token: '',
				timestamp: Date.now()
			};

			/* this is used on the event plan view */
			results.friend.rsvp.initiated = true;
			results.friend.rsvp.initiatedLastDate = Date.now();

			results.friend.save(function(err) {
				me(null, results);
			});
		}, [rpcArgs, req, res]);
	},
};
