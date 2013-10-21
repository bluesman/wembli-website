describe('A Balanced API Holds Object', function() {

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
	var holds = null;
	var err = null;
	var res = null;
	var res2 = null;
	var body = null;

	var num;
	var onBehalfOf;
	var onBehalfOfRes;
	var debitor;
	var debitorRes;
	var createdDebit;

	beforeEach(function() {
		num = Math.floor(Math.random() * 99999999);
		var name = "Tom Walpole " + num;
		var emailAddress = "tom+" + num + "@wembli.com";

		debit = {
			amount: 5000,
			appears_on_statement_as: 'balanced unit test',
			meta: {
				test: true
			},
			description: "test debit " + num,
		}

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

		holds = new b.holds();
		customers = new b.customers();

		err = null;
		res = null;
		res2 = null;
		body = null;
	});

	it('creates a hold', function() {
		/* create a new customer with a bank account for the on behalf of */
		runs(function() {
			customerInfo.ssn_last4 = '0090';
			customerInfo.bank_account = bankAccount;

			customers.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				onBehalfOfRes = resLocal;
				body = bodyLocal;
				onBehalfOf = body;
			});
		});

		waitsFor(function() {
			return onBehalfOfRes;
		}, "customers.create person with bank account", 5000);

		runs(function() {
			customerInfo.ssn_last4 = '0090';
			customerInfo.name = 'Debitor';
			customerInfo.email = 'debitor-unittest' + num + '@test.com';
			customerInfo.card = creditCard;

			customers.create(customerInfo, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				debitorRes = resLocal;
				body = bodyLocal;
				debitor = body;
			});
		});

		waitsFor(function() {
			return debitorRes;
		}, "customers.create person with bank account", 5000);

		runs(function() {
			debit.on_behalf_of = onBehalfOf.uri;
			debit.customer_uri = debitor.uri;

			holds.create(debit, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
	});
		});

		waitsFor(function() {
			return res;
		}, "holds.create", 5000);

		runs(function() {
			debit.on_behalf_of = onBehalfOf.uri;
			debit.customer_uri = debitor.uri;

			customers.setContext(debitor);
			customers.hold(debit, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res2 = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res2;
		}, "customers.hold", 5000);

		runs(function() {
			createdDebit = body;
			expect(res2.statusCode).toBe(201);
		});
	});

	it('Retrieves a hold using a uri', function() {
		runs(function() {
			holds.get(createdDebit.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "holds.get w/uri", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdDebit.uri);
		});

	});

	it('Retrieves a hold using a context', function() {
		runs(function() {
			holds.setContext(createdDebit);
			holds.get(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "holds.get w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdDebit.uri);
		});
	});

	it('captures a hold', function() {
		runs(function() {
			holds.setContext(createdDebit);
			holds.capture(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "holds.capture w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(201);
		});
	});

	it('lists holds for a customer using a context', function() {
		runs(function() {
			customers.setContext(debitor);
			customers.listHolds(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "customers.listHolds w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.items.length).toBeGreaterThan(0);
		});
	});

	/* this doesn't exist */
	it('Lists all holds for a MarketPlace', function() {
		runs(function() {
			holds.list(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "holds.list marketplace", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.items.length).toBeGreaterThan(0);
		});
	});

});