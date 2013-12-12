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
	"submit-signup": function(args, req, res) {
		var me = this;
		/* new customer.  That means req.session.customer does not exist and there is no args.customerId */
		customerRpc['signup'].apply(function(err, results) {
			/* set the login redirect url if the cust already exists */
			if (results.exists) {
				req.session.loginRedirect = true;
				req.session.redirectUrl = '/invitation';
			}

			me(null, results);
		}, [args, req, res]);
	},


	"submit-loginUnconfirmed": function(args, req, res) {
		/* make sure we have email */
		if (!args.customerId) {
			return me(null, {
				success: 1,
				formError: true
			});
		}

		/* fetch it from the db and potentially update firstName, lastName and/or email */

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
	},

	"submit-login": function(args, req, res) {
		var me = this;
		customerRpc['login'].apply(function(err, results) {
			/* set the login redirect url if the cust already exists */

			if (results.error) {
				results.formError = true;
				results.exists = true;
			}
			return me(null, results);
		}, [args, req, res]);
	},

	/* save rsvp date */
	"submit-rsvp": function(args, req, res) {
		var me = this;
		var data = {
			success: 1,
		};

		/* must have a customer to send invite */
		if (!req.session.customer) {
			data.noCustomer = true;
			return me(null, data);
		}


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
			return me(null, data);
		});
	},

	/* send wemblimail */
	"sendWemblimail": function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};


		var rpcArgs = {
			service: args.service,
			serviceId: args.serviceId,
			imageUrl: args.imageUrl,
			name: args.name,
			inviteStatus: args.inviteStatus
		};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			data.noCustomer = true;
			return me(null, data);
		}


		planRpc['addFriend'].apply(function(err, results) {
			console.log(results);
			/* must have a customer to create a plan in the db */
			if (results.noCustomer) {
				data.noCustomer = true;
				return me(null, data);
			}

			if (results.isOrganizer) {
				data.isOrganizer = true;
				return me(null, data);
			}

			/* we can't send the email until the organizer confirms their email address */
			if (req.session.customer.confirmed) {

				/* now that we have added the friend to the plan and have a token, send the wembli email */
				var rsvpLink = "http://" + app.settings.host + ".wembli.com/rsvp/" + req.session.plan.guid + "/" + results.friend.rsvp.token + "/wemblimail";
				wembliEmail.sendRSVPEmail({
					res: res,
					req: req,
					rsvpDate: new Date(req.session.plan.rsvpDate).format('mediumDate'),
					rsvpLink: rsvpLink,
					email: results.friend.contactInfo.serviceId,
					message: args.message,
					friendId: results.friend._id,
					friendName:results.friend.contactInfo.name,
					planGuid: req.session.plan.guid
				});

				/* once the email is sent, we can update inviteStatus to true */
				/* got a friend, set inviteStatus to true - means they have been invited (inviteStatus of false means they are uninvited) */
				results.friend.inviteStatus = true;
				/* clear out the token it is no longer valid - so nothing fishy can happen */
				results.friend.inviteStatusConfirmation = {
					token: '',
					timestamp: Date.now()
				};

				/* this is used on the event plan view */
				/* TODO: make sure fb and twitter set this correctly */
				results.friend.rsvp.status = 'requested';
				results.friend.rsvp.requestedLastDate = Date.now();

				results.friend.save(function(err) {
					me(null, results);
				});

			} else {
				/* customer is not confirmed then we need to queue this email up and send it only once the customer confirms */
				/* set friend.rsvp.status to 'queued' */
				results.friend.rsvp.status = 'queued';
				/* set inviteStatus to true - means this organizer wants this friend to come */
				results.friend.inviteStatus = true;
				/* save the message */
				results.friend.rsvp.message = args.message;

				/* save this */
				results.friend.save(function(err) {
					me(null, results);
				});
			}
		}, [rpcArgs, req, res]);
	},
};
