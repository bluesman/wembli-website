xdescribe('A Balanced API Customers Object', function() {

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
	var createdEmail = null;
	var createdCustomer = null;

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

		customers = new b.customers();
		err = null;
		res = null;
		body = null;
	});

	it('creates a person customer', function() {

		runs(function() {
			customerInfo.ssn_last4 = '0090';
			customers.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});

			waitsFor(function() {
				return res;
			}, "customers.create person", 5000);

			runs(function() {
				createdCustomer = body;
				expect(res.statusCode).toBe(201);
			});
		});
	});

	it('creates a business customer', function() {

		runs(function() {
			customerInfo.business_name = 'Test Business ';
			customerInfo.ein = '45-1929349';

			customers.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});

			waitsFor(function() {
				return res;
			}, "customers.create business", 5000);

			runs(function() {
				expect(res.statusCode).toBe(201);
			});
		});
	});

	it('creates a balanced person customer with a bank account', function() {
		runs(function() {
			customerInfo.ssn_last4 = '0090';
			customerInfo.bank_account = bankAccount;

			customers.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "customers.create person with bank account", 5000);

		runs(function() {
			expect(res.statusCode).toBe(201);
		});

	});

	it('creates a balanced person customer with a credit card', function() {


		runs(function() {
			customerInfo.ssn_last4 = '0090';
			customerInfo.card = creditCard;
			customers.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "customers.create person with credit card", 5000);

		runs(function() {
			expect(res.statusCode).toBe(201);
		});


	});


	it('adds a credit card to an existing customer', function() {


		runs(function() {
			createdCustomer.card = creditCard;
			customers.addCard(createdCustomer.uri, createdCustomer, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "customers.addCard add bank account", 5000);

		runs(function() {
			createdCustomer = body;
			expect(res.statusCode).toBe(200);
		});
	});


	it('adds a bank account to an existing customer', function() {
		createdCustomer.bank_account = bankAccount;

		runs(function() {
			customers.addBankAccount(createdCustomer.uri, createdCustomer, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "customers.addBankAccount add bank account", 5000);

		runs(function() {
			createdCustomer = body
			expect(res.statusCode).toBe(200);
		});
	});


	it('Retrieves a customer using a uri', function() {
		runs(function() {
			customers.get(createdCustomer.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});


		waitsFor(function() {
			return res;
		}, "customers.get w/uri", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdCustomer.uri);
		});

	});

	it('Retrieves a customer using a context', function() {
		runs(function() {
			customers.setContext(createdCustomer);
			customers.get(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "customers.get w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdCustomer.uri);
		});

	});

	it('Lists all customers for a MarketPlace', function() {
		runs(function() {
			customers.list(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "customers.list marketplace", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.items.length).toBeGreaterThan(0);
		});
	});

	it('Updates customer data', function() {
		var updatedCustomer;
		runs(function() {
			updatedCustomer = {};
			updatedCustomer.name = 'New Updated Name';
			customers.update(createdCustomer.uri, updatedCustomer, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "customers.update name", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.name).toBe(updatedCustomer.name);
		});
	});

	it('cannot not be created again', function() {
		runs(function() {
			customerInfo.email = createdCustomer.email;
			customers.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});


		waitsFor(function() {
			return res;
		}, "customers.create", 5000);

		runs(function() {
			expect(res.statusCode).toBe(409);
		});

	});


	it('Deletes a customer', function() {
		runs(function() {
			customers.delete(createdCustomer.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "customers.delete", 5000);

		runs(function() {
			expect(res.statusCode).toBe(204);
		});

	});

});
