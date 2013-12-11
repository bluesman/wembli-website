var async = require('async');

var s = '0b50f03cb15a11e28537026ba7d31e6f';
var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
var b = require('../lib/wembli/balanced-api')({
	secret: s,
	marketplace_uri: m
});

var name = "Tom Walpole";
var emailAddress = "test-cc+1@wembli.com";

var on_behalf_of = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC1U5nfA9wkC6TqZUElOwTeg';
/* use existing buyer and perform a transaction */
var merchant_account_uri = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC1NshOeSmsqVi0gLDjoq7Ir';

var creditCard = {
	card_number: "4111111111111111",
	expiration_month: 12,
	expiration_year: 2015,
	security_code: 123,
	postal_code: 92101,
	name: name
};

var customerInfo = {
	name: name,
	email_address: emailAddress
};

var accounts = new b.accounts();

/* use cases for accounts.create():
 *
 * customer exists

{ status: 'Conflict',
  category_code: 'duplicate-email-address',
  additional: null,
  status_code: 409,
  extras: { account_uri: '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC1NshOeSmsqVi0gLDjoq7Ir' },
  category_type: 'logical',
  _uris: {},
  request_id: 'OHM7c59a5ba02e711e3ac1e026ba7c1aba6',
  description: 'Account with email address "test-cc+1@wembli.com" already exists. Your request id is OHM7c59a5ba02e711e3ac1e026ba7c1aba6.' }

 * invalid card

 { status: 'Conflict',
  category_code: 'card-not-validated',
  additional: null,
  status_code: 409,
  extras: {},
  category_type: 'logical',
  _uris: {},
  request_id: 'OHMa58d02ea030711e3bd4b026ba7c1aba6',
  description: 'Card cannot be validated. Your request id is OHMa58d02ea030711e3bd4b026ba7c1aba6.' }

 * use cases from debits.create():
 * debit fails
 * can you create a buyer if customer is already a merchant?
 * can you create a merchant if customer is already a buyer?
 *
 */

var getCustomerByUri = function(cb) {
	var customer = new b.customers();
	customer.get(uri, {}, function(err, res, body) {
		console.log('got customer');
		console.log(body);
		cb(body);
	});
};

var createCustomerExistingCreditCard = function(cb) {
	console.log('------- creating new customer where card exists --------');
	var num = Math.floor(Math.random() * 99999999);
	customerInfo.email_address = 'test-' + num + '@tomwalpole.com';
	customerInfo.card = creditCard;
	console.log(customerInfo);
	accounts.create(customerInfo, function(err, res, body) {
		console.log(body);
		/* check if this card exists */
		var cards = new b.cards();
		cb(null, body);

	});
};

var createCustomerExistingEmail = function(cb) {
	console.log('------ creating customer where email exists -------');
	accounts.create(customerInfo, function(err, res, body) {
		console.log(err);
		console.log(body);
		cb(null, body);
	});
};

var debitCreditCard = function(cb) {
	var debits = new b.debits();
	debits.create(accountContext.debits_uri, {
		on_behalf_of_uri: on_behalf_of,
		amount: 1100
	}, function(err, res, debitsContext) {
		console.log(err);
		console.log(debitsContext);
		cb(null, debitsContext);
	});
};

var associateMerchantAccountToExistingBuyer = function() {
	console.log('---------- try to create a merchant account when buy already exists ----------');
	/* create a buyer */
	var num = Math.floor(Math.random() * 99999999);
	customerInfo.email_address = 'test-' + num + '@tomwalpole.com';
	customerInfo.card = creditCard;
	console.log(customerInfo);
	accounts.create(customerInfo, function(err, res, buyer) {

		var person = {
			name: customerInfo.name,
			email_address: customerInfo.email_address,
			merchant: {
				type: "person",
				phone_number: "+18583825972",
				email_address: customerInfo.email_address,
				dob: '1976-05',
				name: customerInfo.name,
				street_address: '5875 Eldergardens St',
				postal_code: '92120',
			},
			bank_account: {
				name: 'unassociated bank account 02',
				routing_number: 266086554,
				account_number: 123456789,
				type: "checking",
				meta: {},
			}
		};

		accounts.create(person, function(err, bRes, merchantAccount) {
			if (bRes.statusCode != 201) {
				console.log(merchantAccount);
				switch (merchantAccount.status_code) {
					case 300:
						break;
					case 400:
						break;
					case 409:
						console.log('account exists...getting it');
						/* get account data by account_uri */
						/* update account data */
						accounts.update(merchantAccount.extras.account_uri, person, function(err, bRes, updateResponse) {
							console.log('update to merchant account');
							console.log(updateResponse);
							cb(null, updatedResponse);
						});
						break;
				}
			} else {
				console.log('created merchant account');
				console.log(merchantAccount);
				/* call the balancedAPI to get bank accounts for this customer */
				return cb(null, merchantAccount);
			}

		});
	});
};

var creditMerchant = function(cb) {
	var account = new b.accounts();
	account.get(merchant_account_uri, {}, function(err, res, accountContext) {
		console.log(accountContext);
		/* credit the organizer */
		cb(null, accountContext);
	});

	var credits = new b.credits();
	credits.create(on_behalf_of + ' / credits ', {
		amount: 1100
	}, function(err, res, body) {
		console.log(body)
	});
};

async.series([
	associateMerchantAccountToExistingBuyer,
	//createCustomerExistingEmail,
	//createCustomerExistingCreditCard

], function(err, results) {
	//console.log('exit');
	//console.log(results)
	process.exit(0);
});
