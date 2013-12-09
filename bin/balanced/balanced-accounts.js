var async = require('async');

var s = '0b50f03cb15a11e28537026ba7d31e6f';
var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
var b = require('../lib/wembli/balanced-api')({
	secret: s,
	marketplace_uri: m
});

var num = Math.floor(Math.random() * 99999999);
var name = "Tom Walpole " + num;
var emailAddress = "tom+" + num + "@wembli.com";

var bankAccount = {
	name: "Tom's Bank Account " + num,
	routing_number: 266086554,
	account_number: 123456789,
	type: "checking"
};

var merchant = {
	type: "person",
	name: name,
	email_address: emailAddress,
	phone_number: "+18583825972",
	dob: "1976-05-15",
	street_address: "5875 Eldergardens St.",
	postal_code: "92120",
};

var customerInfo = {
	name: name,
	email_address: emailAddress,
	bank_account: bankAccount,
	merchant: merchant
};

/* create a new person merchant account */
var accounts = new b.accounts();
accounts.create(customerInfo, function(err, res, newAccount) {
	console.log('---- create a new customer with role merchant ----')
	console.log(newAccount);

	/* retrieve the account in different ways */
	async.series([
		function(cb) {
			console.log('---- getting account for uri: ' + newAccount.uri + ' -----');
			accounts.get(newAccount.uri, function(err, res, body) {
				if (err) {
					console.log('error getting account for uri: ' + newAccount.uri);
					console.log(err);
					cb(null);

				} else {
					console.log('---- retrieve account by uri ----');
					console.log(body);
					cb(null);

				}
			});
		},

		function(cb) {
			accounts.setContext(newAccount);
			accounts.get(function(err, res, body) {
				if (err) {
					console.log('error getting account with context set');
					console.log(err);
					cb(null);

				} else {
					console.log('---- retrieve account by context ----');
					console.log(body);
					cb(null);

				}
			});

		},

		/* list all accounts for this marketplace */
		function(cb) {
			accounts.list(function(err, res, body) {
				if (err) {
					console.log('error listing accounts');
					console.log(err);
					cb(null);

				} else {
					console.log('---- accounts listing ----');
					console.log(body);
					cb(null);

				}
			});

		},


		/* list bank accounts for this account */
		function(cb) {
			accounts.setContext(newAccount);
			accounts.listBankAccounts(function(err, res, body) {
				if (err) {
					console.log('error listing bank accounts');
					console.log(err);
					cb(null);

				} else {
					console.log('---- bank accounts listing ----');
					console.log(body);
					cb(null);

				}
			});

		},



	], function(err, result) {
		console.log('finished');
		process.exit(0);
	});

	var customer = function() {
		var customer = new b.customers();
		/* get the customer for this merchant account */
		customer.get(body.customer_uri, {}, function(err, res, body) {
			console.log('got customer');
			console.log(body);
			customer.setContext(body);
			customer.update({
				dob: "1976-05-15",
				address: {
					line1: "5875 Eldergardens St.",
					city: "San Diego",
					state: "CA",
					postal_code: "92120"
				}
			}, function(err, res, body) {
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
	};
});
