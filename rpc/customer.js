//see lib/phatseat-model.js
var phatseatModel = require('phatseat-model');
var Customer = phatseatModel.load('customer');

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