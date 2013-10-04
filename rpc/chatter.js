var wembliModel = require('../lib/wembli-model');
var Chatter = wembliModel.load('chatter');

exports.chatter = {
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
		Chatter.find()
		.where('planGuid').equals(req.session.plan.guid)
		.sort('-created')
		.exec(function(err, chatter) {
			if (err) { return me(err);	}
			data.chatters = chatter;
			me(null,data);
		});
	},


	/* to create chatter you must be in friend or organizer context */
	update: function(args, req, res) {
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

		/* if the context is not friend or organizer - GTFO */
		if (!req.session.visitor.context === 'organizer' && !req.session.visitor.context === 'friend') {
			return me(null, {success:0, error:"not allowed"});
		}

		/* must have a body */
		if (!args.body) {
			return me(null, {success:0, error:"args.body must exist"});
		}

		var actor = {
			name: req.session.customer.firstName + ' ' + req.session.customer.lastName,
			imageUrl: req.session.customer.imageUrl,
			customerId: req.session.customer._id
		};

		/* get the chatter for this plan */
		Chatter.findOne()
		.where('_id').equals(args.chatterId)
		.where('planGuid').equals(req.session.plan.guid)
		.exec(function(err, chatter) {
			if (err) { return me(err);	}
			/* push on to the activity */
			chatter.body = args.body;
			chatter.actor = actor;

			chatter.save(function(err) {
				if (err) {
					return me(err);
				}
				return me(null,data);
			});
		});
	},

	/* to create chatter you must be in friend or organizer context */
	create: function(args, req, res) {
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

		/* if the context is not friend or organizer - GTFO */
		if (!req.session.visitor.context === 'organizer' && !req.session.visitor.context === 'friend') {
			return me(null, {success:0, error:"not allowed"});
		}

		/* must have a body */
		if (!args.body) {
			return me(null, {success:0, error:"args.body must exist"});
		}

		var actor = {
			name: req.session.customer.firstName + ' ' + req.session.customer.lastName,
			imageUrl: req.session.customer.imageUrl,
			customerId: req.session.customer._id
		};
		var body = args.body;
		var chatter = {planGuid: req.session.plan.guid, planId: req.session.plan._id,actor:actor,body:body,comments:[]};

		/* create the chatter */
		var c = new Chatter(chatter);
		c.save(function(err) {
			if (err) {
				return me(err);
			}
			data.chatter = c;
			/* get the feed for this plan */
			Chatter.find()
			.where('planGuid').equals(req.session.plan.guid)
			.sort('-created')
			.exec(function(err, chatters) {
				if (err) { return me(err);	}
				data.chatters = chatters;
				return me(null,data);
			});
		});
	},

	addComment: function(args, req, res) {
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

		/* if the context is not friend or organizer - GTFO */
		if (!req.session.visitor.context === 'organizer' && !req.session.visitor.context === 'friend') {
			return me(null, {success:0, error:"not allowed"});
		}

		if (!args.chatterId) {
			return me(null, {success:0, error:"chatterId is required"});
		}

		/* must have a body */
		if (!args.body) {
			return me(null, {success:0, error:"args.body must exist"});
		}

		var actor = {
			name: req.session.customer.firstName + ' ' + req.session.customer.lastName,
			imageUrl: req.session.customer.imageUrl,
			customerId: req.session.customer._id
		};
		var body = args.body;
		var comment = {actor:actor,body:body};

		/* get the chatter for this plan */
		Chatter.findOne()
		.where('_id').equals(args.chatterId)
		.where('planGuid').equals(req.session.plan.guid)
		.exec(function(err, chatter) {
			if (err) { return me(err);	}
			/* put the comment at the beginning */
			chatter.comments.unshift(comment);
			chatter.markModified('comments');
			chatter.save(function(err) {
				if (err) {
					return me(err);
				}
				/* sort comments by created? */
				data.comments = chatter.comments;
				return me(null,data);
			});
		});
	},

	upVoteComment: function(args, req, res) {
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

		/* if the context is not friend or organizer - GTFO */
		if (!req.session.visitor.context === 'organizer' && !req.session.visitor.context === 'friend') {
			return me(null, {success:0, error:"not allowed"});
		}

		if (!args.commentId) {
			return me(null, {success:0, error:"commentId is required"});
		}

		if (!args.chatterId) {
			return me(null, {success:0, error:"chatterId is required"});
		}

		var actor = {
			name: req.session.customer.firstName + ' ' + req.session.customer.lastName,
			imageUrl: req.session.customer.imageUrl,
			customerId: req.session.customer._id
		};

		var upVote = {actor:actor};

		/* get the chatter for this plan */
		Chatter.findOne()
		.where('_id').equals(args.chatterId)
		.where('planGuid').equals(req.session.plan.guid)
		.exec(function(err, chatter) {
			if (err) { return me(err);	}
			/* find the matching comment */
			for (var i = 0; i < chatter.comments.length; i++) {
				if (chatter.comments[i]._id === args.commentId) {
					chatter.comments[i].upVotes.push(upVote);
				}
			};

			/* push on to the activity */
			chatter.markModified('comments');
			chatter.save(function(err) {
				if (err) {
					return me(err);
				}
				return me(null,data);
			});
		});
	},

	upVoteChatter: function(args, req, res) {
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

		/* if the context is not friend or organizer - GTFO */
		if (!req.session.visitor.context === 'organizer' && !req.session.visitor.context === 'friend') {
			return me(null, {success:0, error:"not allowed"});
		}

		if (!args.chatterId) {
			return me(null, {success:0, error:"chatterId is required"});
		}

		var actor = {
			name: req.session.customer.firstName + ' ' + req.session.customer.lastName,
			imageUrl: req.session.customer.imageUrl,
			customerId: req.session.customer._id
		};

		var upVote = {actor:actor};

		/* get the chatter for this plan */
		Chatter.findOne()
		.where('_id').equals(args.chatterId)
		.where('planGuid').equals(req.session.plan.guid)
		.exec(function(err, chatter) {
			if (err) { return me(err);	}
			/* push on to the activity */
			chatter.upVotes.push(upVote);
			chatter.markModified('upVotes');
			chatter.save(function(err) {
				if (err) {
					return me(err);
				}
				return me(null,data);
			});
		});
	},
};
