xdescribe('A Balanced API Bank Accounts Object', function() {

	var s = '0b50f03cb15a11e28537026ba7d31e6f';
	var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
	var b = require('/wembli/website/lib/wembli/balanced-api')({
		secret: s,
		marketplace_uri: m
	});

	var bankAccount = {};
	var creditCard = {};
	var customerInfo = {};
	var customers = null;
	var err = null;
	var res = null;
	var body = null;
	var createdBankAccount = null;
	var verification;

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

		customerInfo = {
			name: name,
			email: emailAddress,
			meta: {
				test: true
			},
			address: {
				line1: "5875 Eldergardens St.",
				city: 'San Diego',
				state: 'CA',
				postal_code: "92120",
				country_code: 'US',
			},
			phone: '+18581234567',
			dob: "1976-05-15",
		};

		bankAccounts = new b.bank_accounts();
		err = null;
		res = null;
		body = null;
	});

	it('creates a bank account', function() {

		runs(function() {
			bankAccounts.create(bankAccount, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});

			waitsFor(function() {
				return res;
			}, "bankAccounts.create", 5000);

			runs(function() {
				createdBankAccount = body;
				expect(res.statusCode).toBe(201);
			});
		});
	});

	it('credits an existing bank account', function() {
		runs(function() {
			bankAccounts.setContext(createdBankAccount);
			bankAccounts.credit({amount: 1500}, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.get w/uri", 5000);

		runs(function() {
			expect(res.statusCode).toBe(201);
		});
	});

	it('lists credits for a bank account', function() {
		runs(function() {
			bankAccounts.setContext(createdBankAccount);
			bankAccounts.listCredits(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
				console.log(body);
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.get w/uri", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
		});
	});

	it('Retrieves a bank account using a uri', function() {
		runs(function() {
			bankAccounts.get(createdBankAccount.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.get w/uri", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdBankAccount.uri);
		});
	});

	it('Retrieves a bankAccount using a context', function() {
		runs(function() {
			bankAccounts.setContext(createdBankAccount);
			bankAccounts.get(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.get w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdBankAccount.uri);
		});

	});

	it('Lists all bankAccounts for a MarketPlace', function() {
		runs(function() {
			bankAccounts.list(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.list marketplace", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.items.length).toBeGreaterThan(0);
		});
	});

	/* doesn't seem to work */
	xit('Updates bank account data', function() {
		var updatedBankAccount;
		runs(function() {
			updatedBankAccount = {};
			updatedBankAccount.name = 'New Updated Name';
			bankAccounts.update(createdBankAccount.uri, updatedBankAccount, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.update name", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.name).toBe(updatedBankAccount.name);
		});
	});

	it('will not verify a bank account that is not associated with a customer', function() {
		runs(function() {
			bankAccounts.setContext(createdBankAccount);
			bankAccounts.verify(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.verify w/context w/o customer", 5000);

		runs(function() {
			expect(res.statusCode).toBe(409);
		});

	});


	it('Verifies a bank account associated with a customer', function() {
		var customerCreatedRes;
		var customerCreated;
		var accountAddedRes;

		var customers = new b.customers();
		customerInfo.bank_account_uri = createdBankAccount.uri

		runs(function() {
			customers.create(customerInfo, function(e, r, b) {
				customerCreated = b;
				customerCreatedRes = r;
			});
		});

		waitsFor(function() {
			return customerCreatedRes;
		});

		runs(function() {
			customers.setContext(customerCreated);
			/* this works too
			customers.addBankAccount({
					bank_account: bankAccount
				},
				function(e, r, b) {
					accountAddedRes = r;
				});
			*/
			customers.addBankAccount({
					bank_account_uri: createdBankAccount.uri
				},
				function(e, r, b) {
					accountAddedRes = r;
				});

		});

		waitsFor(function() {
			return accountAddedRes;
		});

		runs(function() {
			bankAccounts.verify(createdBankAccount.verifications_uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
				verification = body;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.verify w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(201);
			expect(body.state).toBe('pending');
		});
	});

	it('gets a bank account verification', function() {
		runs(function() {
			bankAccounts.setContext(createdBankAccount);
			bankAccounts.getVerification(verification.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.getVerificationy w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
		});


	});

	it('confirms a bank account', function() {
		runs(function() {
			bankAccounts.confirm(verification.uri, {
				amount_1: 1,
				amount_2: 1
			}, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.confirm w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
		});
	});


	it('Deletes a bank account', function() {
		runs(function() {
			bankAccounts.delete(createdBankAccount.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "bankAccounts.delete", 5000);

		runs(function() {
			expect(res.statusCode).toBe(204);
		});

	});

});
