xdescribe('A Balanced API Credits Object', function() {

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
	var createdCredit = null;

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

		credits = new b.credits();
		err = null;
		res = null;
		body = null;
	});

	it('creates a credit on a new bank account', function() {

		runs(function() {
			credits.create({amount:1500, bank_account: bankAccount}, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});

			waitsFor(function() {
				return res;
			}, "credits.create person", 5000);

			runs(function() {
				createdCredit = body;
				expect(res.statusCode).toBe(201);
			});
		});
	});

	it('Retrieves a credit using a uri', function() {
		runs(function() {
			credits.get(createdCredit.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "credits.get w/uri", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdCredit.uri);
		});

	});

	it('Retrieves a credit using a context', function() {
		runs(function() {
			credits.setContext(createdCredit);
			credits.get(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "credits.get w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdCredit.uri);
		});

	});

	it('Lists all credits for a MarketPlace', function() {
		runs(function() {
			credits.list(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "credits.list marketplace", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.items.length).toBeGreaterThan(0);
		});
	});

});
