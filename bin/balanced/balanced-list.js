var s = '0b50f03cb15a11e28537026ba7d31e6f';
var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
var b = require('../lib/wembli/balanced-api')({
	secret: s,
	marketplace_uri: m
});

var s2 = '42e01b00b15e11e29523026ba7c1aba6';
var m2 = '/v1/marketplaces/MP22BmXshSp7Q8DjgBYnKJmi';

var name = "Tom Walpole";
var emailAddress = "tom+1@wembli.com";

var bankAccount = {
	name: "Tom's Bank Account",
	routing_number:266086554,
	account_number:	123456789,
	type:"checking"
};

var merchant = {
	type: "person",
	name: name,
	email_address: emailAddress,
	phone_number:"+18583825972",
	dob:"1976-05-15",
	street_address:"5875 Eldergardens St.",
	postal_code: "92120",
};

var customerInfo = {
	name: name,
	email_address: emailAddress,
	bank_account:bankAccount,
	merchant:merchant
};

/* create a new person merchant account */
var accounts = new b.accounts();
accounts.create(customerInfo,function(err, res, body) {
	console.log(body);
	var customer = new b.customers();
	/* get the customer for this merchant account */
	customer.get(body.customer_uri,{},function(err, res, body) {
		console.log('got customer');
		console.log(body);
		customer.setContext(body);
		customer.update({dob: "1976-05-15",address: {line1:"5875 Eldergardens St.",city:"San Diego", state:"CA",postal_code:"92120"}},function(err, res, body) {
			console.log('updated customer');
			console.log(body);
			customer.list(function(err, res, body) {
				console.log('listing customers');
				console.log(body);
				customer.delete(function(err, res, body) {
					console.log('deleted customer');
					console.log(body);
				});
			});
		});
	});
});


