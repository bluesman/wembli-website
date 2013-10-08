var s = '0b50f03cb15a11e28537026ba7d31e6f';
var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
var b = require('../lib/wembli/balanced-api')({
	secret: s,
	merchant_uri: m
});
console.log(b);

var s2 = '42e01b00b15e11e29523026ba7c1aba6';
var m2 = '/v1/marketplaces/MP22BmXshSp7Q8DjgBYnKJmi';

var merchant_uri = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC1U5nfA9wkC6TqZUElOwTeg';
/* create a new bank account */
var bankAccount = new b.bank_accounts();
bankAccount.create({
	name: 'unassociated bank account 01',
	routing_number: 266086554,
	account_number: 123456789,
	type: "checking",
	meta: {},
}, function(err, res, body) {
	console.log('created new un-associated bank account');
	console.log(err);
	console.log(body);

	/* associate an un-associated bank account */
	bankAccount.setContext(body);
	bankAccount.get({}, function(err, res, body) {
		console.log('got unassociated bank account');
		console.log(body);
		bankAccount.associateToAccount({
			account_uri: merchant_uri
		}, function(err, res, body) {
			console.log('associated bank account to account');
			console.log(body);

			/* fetch the list of bank accounts for the merchant account to prove it worked */
			var account = new b.accounts();
			account.get(merchant_uri, {}, function(err, res, accountContext) {
				console.log('get merchant account via Accounts');
				console.log(accountContext);

				account.setContext(accountContext);
				account.listBankAccounts({}, function(err, res, bankAccounts) {
					//console.log(err);
					//console.log(res);
					console.log('bank accounts for said account');
					console.log(bankAccounts);

					/* delete bank account */
					bankAccount.delete(function(err, res, body) {
						console.log('deleted bank account');
						console.log(body);
					})
				});
			});
		});
	});
});
