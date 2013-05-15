var wembliModel = require('../lib/wembli-model');
var Feed = wembliModel.load('feed');

exports.feed = {
	get: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		if (!req.session.customer) {
			return me(null,{success:0,error:"not logged in"});
		}

		if (!req.session.plan) {
			return me(null,{success:0,error:"no current plan"});
		}

		/* get the feed for this plan */
		Feed.findOne()
		.where('planGuid').equals(req.session.plan.guid)
		.exec(function(err, feed) {
			if (err) { return me(err);	}
			data.feed = feed;
			me(null,data);
		});
	},

	logActivity: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		if (!req.session.customer) {
			return me(null,{success:0,error:"not logged in"});
		}

		if (!req.session.plan) {
			return me(null,{success:0,error:"no current plan"});
		}

		var actor = {
			name: req.session.customer.firstName + ' ' + req.session.customer.lastName,
			customerId: req.session.customer._id
		};

		var action = {name:args.action};
		var meta = args.meta || {};
		meta.context = req.session.visitor.context;
		var activity = {actor:actor,action:action,meta:meta};

		/* get the feed for this plan */
		Feed.findOne()
		.where('planGuid').equals(req.session.plan.guid)
		.exec(function(err, feed) {
			if (err) { return me(err);	}
			if (feed === null) {
				/* create a new feed */
				var f = new Feed({
					planGuid: req.session.plan.guid,
					activity: [activity]
				});
				console.log('CREATING FEED');
				f.save(function(err) {
					console.log('ERROR CREATING FEED: '+err);
					me(null,data);
				});
			} else {
				console.log('LOG ACTIVITY FOR FEED');
				/* push on to the activity */
				feed.activity.push(activity);
				feed.markModified('activity');
				feed.save(function(err) {
					me(null,data);
				});
			}
		});
	},
};
