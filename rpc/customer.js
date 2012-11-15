var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');

exports.customer = {
	//some methodsi should probably make:
	get: function(args,req,res) {
		//if no customerId then return the customer for this session
	},

	//get all the plans this customer is organizing
	getPlans: function(args,req,res) {

	}

	//get all the plans this customer is invited to
	getPlansInvitedTo: function(args,req,res) {

	}

	/* do i need this? 20120917
	exists: function(email) {
		var me = this;
		console.log(email);

		Customer.findOne({
			email: email
		}, function(err, c) {
			var valid = (c == null) ? 0 : 1;
			me(null, valid);
		});

	}
	*/
}
