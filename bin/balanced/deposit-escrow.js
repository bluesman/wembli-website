var s = '42e01b00b15e11e29523026ba7c1aba6';
var m = '/v1/marketplaces/MP22BmXshSp7Q8DjgBYnKJmi';
var b = require('../lib/wembli/balanced-api')({
	secret: s,
	marketplace_uri: m
});

var name = "Tom Walpole";
var emailAddress = "tom@wembli.com";

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
