var wembliUtils = require('wembli/utils');
var wembliModel = require('../lib/wembli-model');
var Friend      = wembliModel.load('friend');

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
}
