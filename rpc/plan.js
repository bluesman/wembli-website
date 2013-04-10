var wembliUtils = require('wembli/utils');
var wembliModel = require('../lib/wembli-model');
var Friend      = wembliModel.load('friend');
var Ticket      = wembliModel.load('ticket');

exports.plan = {
	init: function(args,req,res) {
		var me = this;

		var data = {
			success:1,
			plan: req.session.plan
		};
		if (req.session.plan) {
			/* get friends for this plan */
			Friend.find({planId:req.session.plan.id}, function(err,results) {
				data.friends = results;
				me(null,data);
			});
		} else {
				me(null,data);
		}
	},

	save: function(args, req, res) {
		var me = this;
		var data = {success:1};
		console.log('plan.save');
		console.log(args);
		console.log('saving plan in rpc');
		console.log(req.session.plan);

		req.session.plan.save(function(err,res) {
			data.plan = req.session.plan;
			me(null,data);
		});

	},

	update: function(args, req, res) {
		var me = this;
		var data = {success:1};
		console.log('plan.save');
		console.log(args);
		req.session.plan.update(args,function(err,res) {
			data.plan = req.session.plan;
			me(null,data);
		});

	},

	setTicketsPriceRange: function(args, req, res) {
		var me = this;
		var data = {success:1};
		console.log(args);
		req.session.plan.preferences.tickets.priceRange = args;
		req.session.plan.save(function(err,res) {
			data.plan = req.session.plan;
			me(null,data);
		});

	},


	addFriend: function(args, req, res) {
		var me = this;

		var data = {success: 1};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			console.log('no customer..back to step 1 please');
			data.noCustomer = true;
			return me(null, data);
		}

		if (!req.session.plan) {
			console.log('no plan...to add friend to');
			data.noPlan = true;
			return me(null, data);
		}

		console.log('add friend to plan:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
			'contactInfo.service': args.service,
			'contactInfo.serviceId': args.serviceId
		};

		Friend.findOne(query, function(err, friend) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to find friends';
				return me(null, data);
			}

			var confirmationTimestamp = new Date().getTime().toString();
			var digestKey = args.serviceId + confirmationTimestamp;
			var confirmationToken = wembliUtils.digest(digestKey);

			if (friend) {
				/* the friend is not invited until the callback sets it to true */
				friend.inviteStatus = args.inviteStatus || false;
				/* make a new inviteStatusToken that will be used to confirm the facebook callback */
				friend.inviteStatusConfirmation = {token:confirmationToken,timestamp:confirmationTimestamp};
				/* update the name */
				friend.contactInfo.name = args.name;
			} else {
				console.log('adding a new friend');
				var set = {
					planId: req.session.plan.id,
					planGuid: req.session.plan.guid,
					contactInfo: {
						service: args.service,
						serviceId: args.serviceId,
						name: args.name,
						imageUrl: args.imageUrl
					},
					rsvp: {token:confirmationToken,tokenTimestamp:confirmationTimestamp},
					inviteStatus: args.inviteStatus || false,
					inviteStatusConfirmation: {token:confirmationToken,timestamp:confirmationTimestamp}
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
				console.log(friend);
				/* now add the friend to the plan */
				req.session.plan.addFriend(friend, function(err) {
					if (err) {
						console.log(err);
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
	},
	addTicketGroup: function(args, req, res) {
		var me = this;

		var data = {success: 1};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			console.log('no customer...');
			data.noCustomer = true;
			return me(null, data);
		}

		if (!req.session.plan) {
			console.log('no plan...to add tickets to');
			data.noPlan = true;
			return me(null, data);
		}

		if (typeof args.ticketGroup === "undefined") {
			console.log('no ticketGroup');
			data.noTicketGroup = true;
			return me(null,data);
		}

		console.log('add tickets to plan:');
		console.log(args);

		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
			'ticketGroup.ID':args.ticketGroup.ID
		};

		/* don't add if its already there */
		Ticket.findOne(query, function(err, ticket) {
			if (err) {
				data.success = 0;
				data.dbError = 'unable to find ticketGroup';
				return me(null, data);
			}

			console.log('ticket in db?');
			console.log(ticket);
			if (ticket !== null) {
				console.log('already added these tix');
				data.ticketGroupExists = true;
				return me(null,data);
			}

			var set = {
				planId: req.session.plan.id,
				planGuid: req.session.plan.guid,
				service:'tn',
				ticketGroup:args.ticketGroup,
				qty:args.qty,
				total:args.total,
			};
			console.log(set);
			if (typeof args.payment !== "undefined") {
				console.log(args.payment);
				var p = JSON.parse(args.payment);

				set.purchased = true;
				set.payment = [{
					organizer: true,
					transactionToken: p.transactionToken,
					customerId:req.session.customer.id,
					amount: p.total,
					qty: p.qty
				}];
			}

			console.log(set);
			ticket = new Ticket(set);

			ticket.save(function(err) {
				if (err) {
					data.success = 0;
					data.dbError = 'unable to save ticketGroup';
					return me(null, data);
				}

				console.log('saved ticket: ' + ticket.id);
				console.log(ticket);

				/* now add the friend to the plan */
				req.session.plan.addTicket(ticket, function(err) {
					if (err) {
						console.log(err);
						data.success = 0;
						data.dbError = 'unable to add ticketGroup ' + ticket.id;
						return me(null, data);
					}
					console.log('added ticketGroup to plan: ' + req.session.plan.guid);
					data.ticketGroup = ticket;

					return me(null, data);
				});
			});
		});
	}
}
