xdescribe('A Balanced API Cards Object', function() {

	var s = '0b50f03cb15a11e28537026ba7d31e6f';
	var m = '/v1/marketplaces/TEST-MPlx4ZJIAbA85beTs7q2Omz';
	var b = require('/wembli/website/lib/wembli/balanced-api')({
		secret: s,
		marketplace_uri: m
	});

	var creditCard = {};
	var cards = null;
	var err = null;
	var res = null;
	var body = null;

	var createdCard = null;

	beforeEach(function() {
		var num = Math.floor(Math.random() * 99999999);
		var name = "Tom Walpole " + num;

		creditCard = {
			card_number: "4111111111111111",
			expiration_month: 12,
			expiration_year: 2015,
			security_code: 123,
			postal_code: 92101,
			name: name
		};

		cards = new b.cards();

		err = null;
		res = null;
		body = null;
	});

	it('creates a credit card', function() {

		runs(function() {
			cards.create(creditCard, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
				console.log(body);
			});

			waitsFor(function() {
				return res;
			}, "cards.create", 5000);

			runs(function() {
				createdCard = body;
				expect(res.statusCode).toBe(201);
			});
		});
	});

	it('Retrieves a card using a uri', function() {
		runs(function() {
			cards.get(createdCard.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "card.get w/uri", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdCard.uri);
		});
	});

	it('Retrieves a card using a context', function() {
		runs(function() {
			cards.setContext(createdCard);
			cards.get(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "cards.get w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.uri).toBe(createdCard.uri);
		});

	});

	it('Lists all cards for a MarketPlace', function() {
		runs(function() {
			cards.list(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "cards.list marketplace", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.items.length).toBeGreaterThan(0);
		});
	});

	/* doesn't seem to work */
	xit('Updates card data', function() {
		var updatedCard;
		runs(function() {
			updatedCard = {};
			updatedCard.name = 'New Updated Name';
			cards.update(createdCard.uri, updatedCard, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "cards.update name", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
			expect(body.name).toBe(updatedCard.name);
		});
	});

	it('invalidates a card', function() {
		runs(function() {
			cards.setContext(createdCard);
			cards.invalidate(function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "cards.invalidate w/context", 5000);

		runs(function() {
			expect(res.statusCode).toBe(200);
		});

	});

	/* it seems delete requires that a customer own the card in order to delete it */
	xit('Deletes a card', function() {
		runs(function() {
			cards.delete(createdCard.uri, function(errLocal, resLocal, bodyLocal) {
				err = errLocal;
				res = resLocal;
				body = bodyLocal;
			});
		});

		waitsFor(function() {
			return res;
		}, "cards.delete", 5000);

		runs(function() {
			expect(res.statusCode).toBe(204);
		});

	});

});
