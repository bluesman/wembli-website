var s = '0b50f03cb15a11e28537026ba7d31e6f';
var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
var b = require('nbalanced');

/* live wembli mkt place */
var s2 = '42e01b00b15e11e29523026ba7c1aba6';
var m2 = '/v1/marketplaces/MP22BmXshSp7Q8DjgBYnKJmi';


var api = new b({
	marketplace_uri: m,
	secret: s
});

/* get account by uri */
api.Accounts.get('/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz/accounts/AC3RMDRyJdI8hCtAWQxr468K',function(err,account) {
	console.log(account);
});

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
