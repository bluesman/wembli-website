var s = '0b50f03cb15a11e28537026ba7d31e6f';
var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
var b = require('../lib/wembli/balanced-api')({
	secret: s,
	marketplace_uri: m
});

var accounts = new b.accounts();
console.log(accounts);
accounts.list(function(err, res, body) {
	console.log(body);
});
