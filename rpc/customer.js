var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');

exports.customer = {

    exists: function(email) {
	var me = this;
	console.log(email);

	Customer.findOne({email:email},function(err,c) { 
	    var valid = (c == null) ? 0 : 1;
	    me(null,valid);
	});

    }
}