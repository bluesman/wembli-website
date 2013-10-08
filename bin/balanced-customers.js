var s = '0b50f03cb15a11e28537026ba7d31e6f';
var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
var b = require('../lib/wembli/balanced-api')({
	secret: s,
	merchant_uri: m
});
console.log(b);

var s2 = '42e01b00b15e11e29523026ba7c1aba6';
var m2 = '/v1/marketplaces/MP22BmXshSp7Q8DjgBYnKJmi';

var num = Math.floor(Math.random() * 99999999);
		var name = "Tom Walpole " + num;
		var emailAddress = "tom+" + num + "@wembli.com";


var customerInfo = {
	name: name,
	email: emailAddress,
	phone_number: "+18583825972",
	dob: "1976-05-15",
	address: {
		line1: "5875 Eldergardens St.",
		city: "San Diego",
		state: "CA",
		postal_code: "92120",
		country_code: "US"
	}
};

var bankAccount = {
	name: "Tom's Bank Account " + num,
	routing_number: 266086554,
	account_number: 123456789,
	type: "checking"
};


var customer = new b.customers();
customer.create(customerInfo, function(err, res, body) {
	console.log('customer created');
	console.log(body);
	customer.setContext(body);
	customer.get(function(err, res, body) {
		console.log('got customer');
		console.log(body);
		customer.update({
			name: "Tom Walpole Updated"
		}, function(err, res, body) {
			console.log('updated customer');
			console.log(body);
			customer.addBankAccount({bank_account: bankAccount}, function(err, res, body) {
				console.log('add bank account');
				console.log(body);
			//	customer.delete(function(err, res, body) {
				//	console.log('deleted customer');
					//console.log(body);
				//});
			});
		});
	});


});
