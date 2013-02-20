var customerRpc = require('../rpc/customer').customer;
var wembliModel = require('../lib/wembli-model');
var Friend      = wembliModel.load('friend');

exports["invite-friends"] = {

	/* signup */
	"submit-step1": function(args, req, res) {
		var me = this;
	  //do signup
	  customerRpc['signup'].apply(function(err,results) {
	  	//set the login redirect url if the cust already exists
	  	if (results.exists) {
	  		req.session.loginRedirect = true;
	  		req.session.redirectUrl = '/invitation';
	  	}
	  	me(null,results);
	  },[args,req,res]);
	},


	/* add facebook friends */
	"submit-step2": function(args, req, res) {
		var me = this;
		var data = {
			success:1,
			formError: false,
		};

		/* must have a customer to create a plan in the db */
		if (!req.session.customer) {
			console.log('no customer..back to step 1 please');
			data.noCustomer = true;
			return me(null,data);
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
				data.dbError ='unable to save plan';
				return me(null,data);
			}
			console.log('saved plan - plan id is:'+req.session.plan.id);

			if (typeof args.friend === "undefined") {
				return me(null,data);
			}
			/* add/update the friend */

			var query = {'planId':req.session.plan.id,'contactInfo.service':'facebook','contactInfo.serviceId':args.friend.id};
			Friend.findOne(query,function(err,friend) {
				if (err) {
					data.success = 0;
					data.dbError = 'unable to find friends';
					return me(null,data);
				}

				if (friend) {
					console.log('updaing existing friend to tatus: '+args.friend.checked);
					friend.inviteStatus = args.friend.checked;
				} else {
					console.log('adding a new friend');
					var set = {
						planId:req.session.plan.id,
						contactInfo: {
							service:'facebook',
							serviceId: args.friend.id,
							name: args.friend.name,
							imageUrl: 'https://graph.facebook.com/'+args.friend.id+'/picture'
						},
						inviteStatus:args.friend.inviteStatus
					}
					console.log(set);
					friend = new Friend(set);
				}

				friend.save(function(err) {
					if (err) {
						data.success = 0;
						data.dbError = 'unable to save friend';
						return me(null,data);
					}
					console.log('saved friend: '+friend.id);
					/* now add the friend to the plan */
					req.session.plan.addFriend(friend,function(err) {
						if (err) {
							data.success = 0;
							data.dbError = 'unable to add friend '+friend.id;
							return me(null,data);
						}
						console.log('added friend to plan: '+req.session.plan.guid);
						data.friend = friend;
						return me(null,data);
					});

				});
			});
		});

	},

	"submit-step3": function(args, req, res) {
		var me = this;
		var data = {
			success:1,
			formError: false,
		};

		me(null,data);
	},
	"submit-step4": function(args, req, res) {
		var me = this;
		var data = {
			success:1,
			formError: false,
		};

		me(null,data);
	},
	"submit-step5": function(args, req, res) {
		var me = this;
		var data = {
			success:1,
			formError: false,
		};

		me(null,data);
	},
	"submit-step6": function(args, req, res) {
		var me = this;
		var data = {
			success:1,
			formError: false,
		};

		me(null,data);
	}

};