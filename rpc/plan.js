var wembliModel = require('../lib/wembli-model');
var Friend      = wembliModel.load('friend');

exports.plan = {
	init: function(args,req,res) {
		var me = this;

		var data = {
			success:1,
			plan: req.session.plan
		};

		/* get friends for this plan */
		Friend.find({planId:req.session.plan.id}, function(err,results) {
			data.friends = results;
			me(null,data);
		})
	}

}
