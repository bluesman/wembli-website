var async = require('async');
var nbalanced = require('../../bluesman-nbalanced/lib/nbalanced');

exports.dashboard = {
	init: function(args, req, res) {

		var me = this;
		var data = {
			success: 1,
		};

		if (typeof req.session.customer === "undefined") {
			me(null, {
				success: 1,
				noCustomer: true,
				error: true
			});
		}

		var c = req.session.customer;

		var tasks = [

		/* get plans this customer is organizing */
		function(cb) {
			c.getPlans(function(err, plans) {
				if (err) {
					return cb(err);
				};
				cb(null, plans);
			});
		},

		/* get plans this customer is invited to */
		function(cb) {
			c.getInvitedPlans(function(err, plans) {
				if (err) {
					return cb(err);
				};
				cb(null, plans);
			});
		},

		/* get a list of people this customer has ever invited */
		function(cb) {
			c.getInvitedFriends(function(err, friends) {
				if (err) {
					return cb(err);
				};
				cb(null, friends);
			});
		},
		];

		var finished = function(err, results) {
			if (err) {
				return me(err);
			};

			data.organizer = results[0][0];
			data.archived = results[0][1];
			data.invited = results[1][0];
			/* add old events where this cust was the friend */
			data.archived.concat(results[1][1]);
			data.friends = results[2];

			console.log('get All Plans:');
			console.log(data);
			me(null, data);
		};

		async.parallel(tasks, finished);
	},

	getFeed: function(args, req, res) {

	}
}
