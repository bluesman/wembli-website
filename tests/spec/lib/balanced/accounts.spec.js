xdescribe('A Balanced API Accounts Object', function() {

	var async = require('async');
	var s = '0b50f03cb15a11e28537026ba7d31e6f';
	var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
	var b = require('/wembli/website/lib/wembli/balanced-api')({
		secret: s,
		marketplace_uri: m
	});

	var bankAccount = {};
	var creditCard = {};
	var merchant = {};
	var customerInfo = {};
	var accounts = null;
	var err = null;
	var res = null;
	var body = null;
	var createdEmail = null;
	var createdAccount = null;

	beforeEach(function() {
		var num = Math.floor(Math.random() * 99999999);
		var name = "Tom Walpole " + num;
		var emailAddress = "tom+" + num + "@wembli.com";

		bankAccount = {
			name: "Tom's Bank Account " + num,
			routing_number: 266086554,
			account_number: 123456789,
			type: "checking"
		};

		creditCard = {
			card_number: "4111111111111111",
			expiration_month: 12,
			expiration_year: 2015,
			security_code: 123,
			postal_code: 92101,
			name: name
		};

		merchant = {
			type: "person",
			name: name,
			email_address: emailAddress,
			phone_number: "+18583825972",
			dob: "1976-05-15",
			street_address: "5875 Eldergardens St.",
			postal_code: "92120",
		};

		customerInfo = {
			name: name,
			email_address: emailAddress,
		};

		accounts = new b.accounts();
		err = null;
		res = null;
		body = null;
	});

	it('creates an account with no roles', function() {
		runs(function() {
			accounts.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});

			waitsFor(function() {
				return body;
			}, "accounts.create account", 5000);

			runs(function() {
				expect(res.statusCode).toBe(201);
				expect(body.roles[0]).not.toBeDefined();
			});
		});
	});

	it('creates a balanced account with person merchant role', function() {
		customerInfo.bank_account = bankAccount;
		customerInfo.merchant = merchant;
		runs(function() {
			accounts.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});

			waitsFor(function() {
				return body;
			}, "accounts.create person merchant ", 5000);

			runs(function() {
				expect(res.statusCode).toBe(201);
				expect(body.roles).toContain('merchant');
			});
		});
	});

	it('creates a balanced account with business merchant role', function() {
		merchant.type = 'business';
		merchant.tax_id = "393483992";
		delete merchant.dob;

		merchant.person = {
			"phone_number": "+16505551234",
			"name": "William James",
			"dob": "1842-01-01",
			"postal_code": "10023",
			"country_code": "USA",
			"street_address": "167 West 74th Street",
			"tax_id": "393483992"
		};

		customerInfo.merchant = merchant;
		customerInfo.bank_account = bankAccount;
		runs(function() {
			accounts.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return body;
		}, "accounts.create business merchant", 5000);

		runs(function() {
			expect(res.statusCode).toBe(201);
			expect(body.roles).toContain('merchant');
		});
	});

	it('creates a balanced account with buyer role', function() {
		customerInfo.card = creditCard;
		createdEmail = customerInfo.email_address;
		runs(function() {
			accounts.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});


		waitsFor(function() {
			return body;
		}, "accounts.create buyer", 5000);

		runs(function() {
			createdAccount = body;
			expect(res.statusCode).toBe(201);
			expect(body.roles).toContain('buyer');

		});
	});


	it('Promotes a buyer to be a merchant', function() {
		createdAccount.merchant = merchant;
			console.log(createdAccount);
		runs(function() {
			accounts.promote(createdAccount.uri, createdAccount, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
				console.log(res.statusCode);
				console.log(body);
			});
		});


		waitsFor(function() {
			return body;
		}, "accounts.promote buyer to merchant", 5000);

		runs(function() {
			createdAccount = body;
			expect(res.statusCode).toBe(200);
			expect(body.roles).toContain('buyer');
			expect(body.roles).toContain('merchant');

		});

	});

	it('Retrieves an account using a uri', function() {
		runs(function() {
			accounts.get(createdAccount.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});


		waitsFor(function() {
			return body;
		}, "accounts.get", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdAccount.uri);
		});

	});

	it('Retrieves an account using a context', function() {
		runs(function() {
			accounts.setContext(createdAccount);
			accounts.get(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});


		waitsFor(function() {
			return body;
		}, "accounts.get", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdAccount.uri);
		});

	});

	it('Lists all accounts for a MarketPlace', function() {
		runs(function() {
			accounts.list(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});


		waitsFor(function() {
			return body;
		}, "accounts.list marketplace", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.items.length).toBeGreaterThan(0);
		});


	});

	it('Lists all bank accounts for an account', function() {
		runs(function() {
			console.log(createdAccount);
			accounts.setContext(createdAccount);
			accounts.listBankAccounts(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
				console.log(res.statusCode);
				console.log(body);
			});

		});

		waitsFor(function() {
			return body;
		}, "accounts.list account", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.items.length).toBeGreaterThan(0);
		});


	});

	it('Updates account data', function() {
		var updatedAccount = createdAccount;
		updatedAccount.name = 'New Updated Name';
		console.log(updatedAccount);
		runs(function() {

			accounts.update(createdAccount.uri, updatedAccount, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
				console.log(res.statusCode);
				console.log(body);
			});

		});

		waitsFor(function() {
			return body;
		}, "accounts.update name", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.name).toBe(updatedAccount.name);
		});

	});

	it('cannot not be created again', function() {
		//console.log(customerInfoLocal);
		customerInfo.email_address = createdEmail;

		runs(function() {
			accounts.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});


		waitsFor(function() {
			return body;
		}, "accounts.create", 5000);

		runs(function() {
			expect(res.statusCode).toBe(409);
		});

	});


	it('Deletes a bank account', function() {
		runs(function() {
			console.log(createdAccount);
			accounts.delete(createdAccount.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
				console.log(res.statusCode);
				console.log(body);
			});
		});


		waitsFor(function() {
			return body;
		}, "accounts.delete", 5000);

		runs(function() {
			expect(res.statusCode).toBe(204);
		});

	});

});
