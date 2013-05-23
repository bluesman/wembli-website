var s = '0b50f03cb15a11e28537026ba7d31e6f';
var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
var b = require('../../bluesman-nbalanced/lib/nbalanced');

var s2 = '42e01b00b15e11e29523026ba7c1aba6';
var m2 = '/v1/marketplaces/MP22BmXshSp7Q8DjgBYnKJmi';


var api = new b({
	marketplace_uri: m,
	secret: s
});

/* create a new merchant account */
var person = {
	type: "person",
	name: "Test Merchant",
	phone_number: "+15184242283",
	email_address: "test-merchant-06@tomwalpole.com",
	meta:{},
	//tax_id:'5302',
	//dob: "1970-06-18",
	street_address: "5875 Eldergardens St.",
	//city: "San Diego",
	//state: "CA",
	postal_code: "99999",
	country_code: "US"
};

var bankAccount = {
	name: "Test Bank May 23 - 1",
	routing_number: 266086554,
	account_number: 123456789,
	type: "checking",
	meta: {},
}

person.bank_account = bankAccount;
console.log(person);
api.Accounts.underwrite(person, function(err, result) {
	if (err) {
		console.log(err);
		if (err.status_code === 409) {
			console.log('account exists...getting it');
			/* get account data by account_uri */
			api.Accounts.get(err.extras.account_uri, function(err, accountData) {
				console.log(accountData);
				/* update account data */
				api.Accounts.update(accountData.uri, {
					name: "Sweet Genius 02",
					bank_account:bankAccount
				}, function(err, updateResponse) {
					console.log('update to sweet genius');
					console.log(updateResponse);
					var act = api.Accounts.nbalanced(accountData);
				});
			});
		}
	} else {
		console.log('created merchant account');
		console.log(result);
		/* now create a bank account and add it to this merchant account */
/*
		api.BankAccounts.create(bankAccount, function(err, ba) {
			if (err) {
				console.log(err);
			} else {
				console.log('created bank account');
				var act = api.Accounts.nbalanced(result);
				act.addBankAccount(result.uri,ba.uri,function(err,res) {
					if (err) {
						console.log('error adding bank account');
						console.log(err);
					} else {
						console.log('added bank account');
						console.log(res);
					}
				});
			}
		});
*/
	}

});

/* get account by uri
api.Accounts.get('/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC3RMDRyJdI8hCtAWQxr468K',function(err,account) {
	console.log(account);
});
*/

/* check if this account exists */
/*
api.Accounts.list({limit:10,offset:0},function(err,result) {
	console.log(result);
});
*/

/* i think this actually does the underwriting too */
/*
 */
/*
api.Accounts.underwrite({

            type: "person",
            name: "Tabitha Royce",
            phone_number: "+15023335555",
            dob: "1981-12-01",
            postal_code: "90210",
            street_address: "123 Rodeo Drive"
        }, function (err, object) {
            if (err) {
                console.error("api.Accounts.underwrite", "person", err);
                throw err;
            }
            myAccount = object;
            // Create a new instance of our api client with our new account info
            api = api.Accounts.nbalanced(myAccount);
            console.log(myAccount);

        });
*/
