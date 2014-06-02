var querystring = require('querystring');
var fs = require('fs');
var wembliMail = require('wembli/email');
var wembliUtils = require('wembli/utils');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Notify = wembliModel.load('notify');
var Plan = wembliModel.load('plan');
var Ticket = wembliModel.load('ticket');
var Feed = wembliModel.load('feed');
var balanced = require('wembli/balanced-api')({
	secret: app.settings.balancedSecret,
	marketplace_uri: app.settings.balancedMarketplaceUri
});
var mcapi = require('mailchimp-api');
var mc = new mcapi.Mailchimp(app.settings.mailchimpKey);
var async = require('async');

exports.customer = {

	/* deprecated */
	updateAccountHolderInfo: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* make sure there is a customer */
		if (!req.session.customer) {
			data.success = 0;
			data.error = true;
			data.errorMessage = 'customer must be logged in';
			return me(null, data);
		}

		var customer = new balanced.customers();
		customer.update(req.session.customer.balancedAPI.customerAccount.uri, args, function(err, bRes, bCustomer) {
			/* get bank accounts for this customer */
			customer.setContext(bCustomer);
			customer.listBankAccounts(function(err, bRes, bankAccounts) {
				data.accountHolderInfo = bCustomer;
				data.bankAccounts = bankAccounts;
				req.session.customer.balancedAPI.customerAccount = bCustomer;
				req.session.customer.balancedAPI.bankAccounts = bankAccounts;

				req.session.customer.markModified('balancedAPI');
				req.session.customer.save(function(err) {
					return me(null, data);
				});
			});
		});
	},

	/* deprecated */
	addBankAccount: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* make sure there is a customer */
		if (!req.session.customer) {
			data.success = 0;
			data.error = true;
			data.errorMessage = 'customer must be logged in';
			return me(null, data);
		}

		if (typeof req.session.customer.balancedAPI.merchantAccount === "undefined") {
			//there are not bank accounts
			data.bankAccounts = [];
			return me(null, data);
		}

		var accountInfo = {
			bank_account: {
				name: args.name,
				routing_number: args.routingNumber,
				account_number: args.accountNumber,
				type: args.type
			}
		};

		var bAccount = new balanced.accounts();
		bAccount.update(req.session.customer.balancedAPI.merchantAccount.uri, accountInfo, function(err, bRes, result) {
			if (bRes.statusCode !== 200) {
				data.success = 0;
				data.error = result;
				return me(null, data);
			}

			/* get a list of bank accounts for this merchant */
			var bAccount = new balanced.accounts();
			bAccount.listBankAccounts(req.session.customer.balancedAPI.merchantAccount.bank_accounts_uri, {
				limit: 100,
				offset: 0
			}, function(err, bRes, bankAccounts) {
				data.bankAccount = result;
				data.bankAccounts = bankAccounts;
				req.session.customer.balancedAPI.customerAccount.bank_accounts = bankAccounts;
				req.session.customer.markModified('balancedAPI.customerAccount');
				req.session.customer.save(function(err) {
					return me(null, data);
				});
			});
		});
	},

	/* deprecated */
	deleteBankAccount: function(args, req, res) {
	},

	/* deprecated */
	listBankAccounts: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* make sure there is a customer */
		if (!req.session.customer) {
			data.success = 0;
			data.error = true;
			data.errorMessage = 'customer must be logged in';
			return me(null, data);
		}

		if (typeof req.session.customer.balancedAPI.merchantAccount === "undefined") {
			//there are not bank accounts
			data.bankAccounts = [];
			return me(null, data);
		}

		/* call the balancedAPI to get bank accounts for this customer */
		var api = new nbalanced({
			marketplace_uri: app.settings.balancedMarketplaceUri,
			secret: app.settings.balancedSecret
		});

		api.Customers.get(req.session.customer.balancedAPI.merchantAccount.customer_uri, function(err, customer) {
			var custApi = api.Customers.nbalanced(customer);
			custApi.BankAccounts.list(args, function(err, ba) {
				data.bankAccounts = ba;
				return me(null, data);
			});
		});
	},

	createCreditCard: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		var saveCustomer = function(bCustomer) {
			var customer = new balanced.customers(bCustomer);
			customer.listCards(function(err, bRes, cards) {
				data.accountHolderInfo = bCustomer;
				data.creditCards = cards;
				req.session.customer.balancedAPI.customerAccount = bCustomer;
				req.session.customer.balancedAPI.creditCards = cards;

				req.session.customer.markModified('balancedAPI.customerAccount');
				req.session.customer.markModified('balancedAPI.creditCards');
				req.session.customer.save(function(err) {
					return me(null, data);
				});
			});
		};


		var creditCard = {
			card_number: args.creditCardNumber,
			expiration_month: args.expirationDateMonth,
			expiration_year: args.expirationDateYear,
			security_code: args.cvv,
			postal_code: args.postalCode,
			name: args.cardHolderName
		}

		var buyer = {
			name: req.session.customer.firstName + ' ' + req.session.customer.lastName,
			email: req.session.customer.email,
			card: creditCard,
			meta: {
				customerId: req.session.customer._id
			}
		};

		/* if this card exists, update it instead of adding it */
		if (typeof req.session.customer.balancedAPI !== "undefined" &&
				typeof req.session.customer.balancedAPI.creditCards !== "undefined") {
			var exists = false;
			req.session.customer.balancedAPI.creditCards.items.forEach(function(card) {
				if (card.card_number === args.creditCardNumber) {
					exists = true;
				}
			});

			if (exists) {
				/* TODO: updated the card w/balanced and in the db */
				data.success = 0;
				data.error = true;
				data.errorMessage = 'credit card exists';
				return me(null,data);
			}
		}

		/* check for an existing balancedAPI.customerAccount - if exists, just add the creditCard to it */
		if (typeof req.session.customer.balancedAPI !== "undefined" &&
				typeof req.session.customer.balancedAPI.customerAccount !== "undefined") {

			/* add the card */
			var bCards = new balanced.cards();
			bCards.create(creditCard, function(err, res, card) {

				if (card.status_code == '400') {
					data.body = card;
					data.success = 0;
					if (card.category_code == 'card-number-not-valid') {
						data.error = true;
						data.errorMessage = 'The credit card number is not valid.';
					}
					return me(null, data);
				}

				console.log('CUSTOMER CARD:');
				console.log(card);
				/* now debit the card */
				var bCustomers = new balanced.customers();
				bCustomers.addCard(req.session.customer.balancedAPI.customerAccount.uri, {card_uri: card.uri}, function(err, res, custData) {
					console.log('added card to existing customer');
					console.log(err);
					console.log(res);
					console.log(custData);
					/* if there's an error gtfo */
					if (err) {
						data.success = 0;
						data.error = true;
						data.errorMessage = 'unable to add card: ' + err;
						return me(null, data);
					}

					bCustomers.setContext(custData);
					bCustomers.listCards(function(err, bRes, cards) {
						console.log('list cards:');
						console.log(err,bRes,cards);
						data.creditCards = cards;
						req.session.customer.balancedAPI.creditCards = cards;
						req.session.customer.markModified('balancedAPI.creditCards');
						req.session.customer.balancedAPI.customerAccount = custData;
						req.session.customer.markModified('balancedAPI.customerAccount');
						req.session.customer.save(function(err) {
							return me(null, data);
						});
					});
				});
			});
		} else {
			/* there is no customerAccount - create it and add the card */
			var bCustomers = new balanced.customers();
			bCustomers.create(buyer, function(err, res, body) {
				/* if there's an error gtfo */
				if (err) {
					data.success = 0;
					data.error = true;
					data.errorMessage = 'unable to create balanced customer: ' + err;
					return me(null, data);
				}

				if (body.status_code == '409') {
					data.body = body;
					data.success = 0;
					if (body.category_code == 'card-not-validated') {
						data.error = true;
						data.errorMessage = 'Card could not be validated.';
					}
					return me(null, data);
				}

				/* save this in our customer document */
				req.session.customer.balancedAPI.customerAccount = body;
				req.session.customer.markModified('balancedAPI.customerAccount');

				bCustomers.setContext(body);
				/* add the creditcards to this customer */
				bCustomers.listCards(function(err, res, cards) {
					req.session.customer.balancedAPI.creditCards = cards;
					req.session.customer.markModified('balancedAPI.creditCards');

					/* save the balancedAPI data for this customer */
					req.session.customer.save(function(err, c) {

						if (err) {
							data.success = 0;
							data.error = true;
							data.errorMessage = 'unable to save customer: ' + err;
							return me(null, data);
						}
						data.creditCards = cards;
						return me(null, data);
					});
				});
			});
		}
	},

	createMerchantAccount: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		var saveCustomer = function(bCustomer) {
			var customer = new balanced.customers(bCustomer);
			customer.listBankAccounts(function(err, bRes, bankAccounts) {
				data.accountHolderInfo = bCustomer;
				data.bankAccounts = bankAccounts;
				req.session.customer.balancedAPI.customerAccount = bCustomer;
				req.session.customer.balancedAPI.bankAccounts = bankAccounts;

				req.session.customer.markModified('balancedAPI.customerAccount');
				req.session.customer.markModified('balancedAPI.bankAccounts');
				req.session.customer.save(function(err) {
					return me(null, data);
				});
			});
		};

		/* create a new merchant account */
		var person = {
			name: args.name,
			email: req.session.customer.email,
			meta: {
				customerId: req.session.customer._id
			},
			phone: "+1" + args.phoneNumber,
			dob: args.dob,
			address: {
				line1: args.streetAddress,
				postal_code: args.postalCode,
			},
			bank_account: {
				name: args.bankAccount.name,
				routing_number: args.bankAccount.routingNumber,
				account_number: args.bankAccount.accountNumber,
				type: args.bankAccount.type,
			}
		};

		/* extra info incase underwriting fails the first time */
		if (typeof args.ssn_last4 !== "undefined") {
			person.ssn_last4 = args.ssn_last4;
		}
		if (typeof args.city !== "undefined") {
			person.address.city = args.city;
		}
		if (typeof args.country_code !== "undefined") {
			person.address.country_code = args.country_code;
		}

		var customers = new balanced.customers();
		customers.create(person, function(err, bRes, bCustomer) {
			if (bRes.statusCode != 201) {
				switch (bCustomer.status_code) {
					case 300:
						break;
					case 400:
						break;
					case 409:
						/* get account data by account_uri */
						/* update account data */
						customers.update(bCustomer.extras.account_uri, person, function(err, bRes, updateResponse) {
							return saveCustomer(updatedResponse);
						});
						break;
				}
			} else {
				/* get the customer for this merchant account */

				/* call the balancedAPI to get bank accounts for this customer */
				return saveCustomer(bCustomer);
			}
		});
	},

	deleteCreditCard: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		/* make sure there is a customer */
		if (!req.session.customer) {
			data.success = 0;
			data.error = true;
			data.errorMessage = 'customer must be logged in';
			return me(null, data);
		}

		if (typeof req.session.customer.balancedAPI.creditCards === "undefined") {
			//there are not bank accounts
			data.creditCards = [];
			return me(null, data);
		}

		/* find the bank account we're dealing with */
		var card = req.session.customer.balancedAPI.creditCards.items[0];
		console.log('deleting card:');
		console.log(card);

		/* get a list of bank accounts for this customer */
		var customer = new balanced.customers(req.session.customer.balancedAPI.customerAccount);
		customer.listCards(function(err, bRes, cards) {
			console.log('cards');
			console.log(cards);
			console.log(err);
			console.log(bRes);
			/* find the matching bank account uri and delete it */
			var items = [];
			var deleted = false;
			cards.items.forEach(function(c) {
				if (c.uri == card.uri) {
					deleted = true;
					/* safe to delete this bank account */
					var bCard = new balanced.cards();
					bCard.delete(c.uri, function(err, bRes, result) {
						console.log(err);
						console.log(bRes);
						console.log(result);
						//TODO check err
						customer.listCards(function(err, bRes, creditCards) {
							req.session.customer.balancedAPI.creditCards = creditCards;
							req.session.customer.markModified('balancedAPI.creditCards');
							req.session.customer.save(function(err) {
								return me(null, data);
							});
						});
					});
				}
			});
			if (!deleted) {
				data.success = 0;
				data.error = true;
				data.errorMessage ='did not find credit card to delete';
				return me(null, data);
			}
		});
	},

	deleteBankAccount: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		/* make sure there is a customer */
		if (!req.session.customer) {
			data.success = 0;
			data.error = true;
			data.errorMessage = 'customer must be logged in';
			return me(null, data);
		}

		if (typeof req.session.customer.balancedAPI.bankAccounts === "undefined") {
			//there are not bank accounts
			data.bankAccounts = [];
			return me(null, data);
		}

		/* find the bank account we're dealing with */
		var bankAccount = req.session.customer.balancedAPI.bankAccounts.items[0];
		console.log('deleting account:');
		console.log(bankAccount);

		/* get a list of bank accounts for this customer */
		var customer = new balanced.customers(req.session.customer.balancedAPI.customerAccount);
		customer.listBankAccounts(function(err, bRes, bankAccounts) {
			console.log('bank accounts');
			console.log(bankAccounts);
			console.log(err);
			console.log(bRes);
			/* find the matching bank account uri and delete it */
			var items = [];
			var deleted = false;
			bankAccounts.items.forEach(function(bank) {
				if (bank.uri == bankAccount.uri) {
					deleted = true;
					/* safe to delete this bank account */
					var bBank = new balanced.bank_accounts();
					bBank.delete(bank.uri, function(err, bRes, result) {
						console.log(err);
						console.log(bRes);
						console.log(result);
						//TODO check err
						customer.listBankAccounts(function(err, bRes, bankAccounts) {
							req.session.customer.balancedAPI.bankAccounts = bankAccounts;
							req.session.customer.markModified('balancedAPI.bankAccounts');
							req.session.customer.save(function(err) {
								return me(null, data);
							});
						});
					});
				}
			});
			if (!deleted) {
				data.success = 0;
				data.error = true;
				data.errorMessage ='did not find bank account to delete';
				return me(null, data);
			}
		});
	},

	changePassword: function(args, req, res) {
		var me = this;
		var data = {
			success: 1,
			formError: false,
			passwordMismatch: false,
			passwordTooShort: false
		};
		/* get the customer from the session and change the pword */
		if (typeof req.session.customer === "undefined") {
			return me('no customer available to change password for');
		}

		/* passwords must be > 3 chars */
		if (args.password.length < 3) {
			data.formError = true;
			data.passwordTooShort = true;
			return me(null, data);
		}

		/* passwords must match */
		if (args.password !== args.password2) {
			data.formError = true;
			data.passwordMismatch = true;
			return me(null, data);
		}

		/* now update the password */
		var digest = wembliUtils.digest(args.password);
		req.session.customer.password = digest;
		req.session.customer.save(function(err) {
			if (err) {
				return me(err);
			}
			return me(null, data);
		});
	},

	signup: function(args, req, res) {
		var me = this;

		if (typeof req.session.signupForm === "undefined") {
			req.session.signupForm = {};
		};

		var data = {
			success: 1,
			firstName: null,
			lastName: null,
			email: null,
			formError: false,
			exists: false
		};

		var respond = function(data) {
			req.session.signupForm.firstName = data.firstName || req.session.signupForm.firstName || args.firstName;
			req.session.signupForm.lastName = data.lastName || req.session.signupForm.lastName || args.lastName;
			req.session.signupForm.email = data.email || req.session.signupForm.email || args.email;
			req.session.signupForm.formError = data.formError;
			req.session.signupForm.exists = data.exists;
			req.session.signupForm.loginRedirect = data.loginRedirect || req.session.loginRedirect;
			req.session.signupForm.redirectUrl = data.redirectUrl || req.session.redirectUrl;
			req.session.signupForm.noPassword = data.noPassword;

			me(null, req.session.signupForm);
		};

		if (!args.email) {
			req.syslog.error('no email in signup');
			data.formError = true;
			return respond(data);
		}

		//fetch the customer by email
		Customer.findOne({
			email: args.email
		}, function(err, c) {
			//error happened
			if (err) {
				req.syslog.error('error finding customer in signup');
				data.success = 0;
				return respond(data);
			}

			//customer exists
			if (c !== null) {
				req.syslog.notice('email: ' + args.email + ' is already signed up');
				//they've already signed up
				data.exists = true;
				if (typeof c.password === "undefined") {
					/* send forgot password email */
					data.noPassword = true;
					data.error = true;
					/* send forgot password email */
					var noToken = true;

					/* have a c, make a forgot password token (or if there is already one in the db that is not expired, use it) */
					if (typeof c.forgotPassword[0] != "undefined") {
						/* check if this token is expired */
						var dbTimestamp = c.forgotPassword[0].timestamp;
						var currentTimestamp = new Date().getTime();
						var timePassed = (currentTimestamp - dbTimestamp) / 1000;
						//has it been more than 2 days?
						var noToken = (timePassed < 172800) ? false : true;
					}

					if (noToken) {
						//make a new token
						var tokenTimestamp = new Date().getTime().toString();
						var tokenHash = wembliUtils.digest(args.email + tokenTimestamp);
					} else {
						//use the existing token
						var tokenHash = c.forgotPassword[0].token;
						var tokenTimestamp = c.forgotPassword[0].timestamp;
					}

					var forgotPassword = [{
						timestamp: tokenTimestamp,
						token: tokenHash
					}];

					c.update({
						forgotPassword: forgotPassword
					}, function(err) {
						if (err) {
							return me('dbError: error updating forgotPassword Token');
						}

						var mailArgs = {
							res: res,
							req: req,
							tokenHash: tokenHash,
							customer: c,
							next: args.next
						}

						wembliMail.sendForgotPasswordEmail(mailArgs)
					});
				}
				return respond(data);
			}

			/* password is not reuired anymore
			args.password = (args.password) ? args.password : 'temp';
			var digest = wembliUtils.digest(args.password);
			*/
			var newC = {
				email: args.email,
				firstName: args.firstName,
				lastName: args.lastName,
				//password: digest,
				confirmed: false
			};

			//if there's ipinfo in the session grab the zip
			if (/\d+/.test(req.session.visitor.tracking.postalCode)) {
				newC.postalCode = req.session.visitor.tracking.postalCode;
			}

			var customer = new Customer(newC);

			var confirmationTimestamp = new Date().getTime().toString();
			var digestKey = args.email + confirmationTimestamp;
			var confirmationToken = wembliUtils.digest(digestKey);

			customer.confirmation.push({
				timestamp: confirmationTimestamp,
				token: confirmationToken
			});

			customer.save(function(err) {
				if (err) {
					req.syslog.error('error creating customer in signup');
					data.success = 0;
					return respond(data);
				}

				req.session.loggedIn = true;
				req.session.customer = customer;

				/* send signup email async */
				wembliMail.sendSignupEmail({
					res: res,
					req: req,
					confirmationToken: confirmationToken,
					customer: customer,
					promo: args.promo,
					next: args.next
				});

				/* TODO: make this a promise */
				if (typeof args.listId !== "undefined") {
					mc.lists.subscribe({
							id: args.listId,
							email: {
								email: args.email
							},
							merge_vars: {
								fname: args.firstName,
								lname: args.lastName,
								optin_ip: req.session.visitor.tracking.ipAddress,
								optin_time: new Date(),
							},
							double_optin: false,
							send_welcome: false
						}, function(data) {
							req.syslog.notice(args.email + ' subscribed to list: ' + args.listId);
						},
						function(error) {
							req.syslog.err('unable subscribe email ' + args.email + ' to list: ' + args.listId);
						});
				}

				if (typeof req.session.plan !== "undefined") {
					/* sanity check - make sure this plan does not have an organizer */
					if (req.session.plan.organizer.customerId) {
						return respond(data);
					}

					/* this plan does not yet have an organizer whew! */
					req.session.plan.organizer.customerId = customer.id;
					req.session.visitor.context = 'organizer';

					req.session.plan.save(function(err) {
						customer.addPlan(req.session.plan.guid, function(err) {

							/* see if there are any tickets to add */
							if (req.session.ticketsToAdd) {
								var ticketIds = [];
								async.forEach(req.session.ticketsToAdd, function(set, tixToAddCb) {
									set.planId = req.session.plan._id;
									console.log('adding ticket on create customer');
									console.log(set);
									ticket = new Ticket(set);

									ticket.save(function(err) {
										if (err) {
											data.success = 0;
											data.dbError = 'unable to save ticketGroup: ' + err;
											console.log('error adding ticket to plan:');
											console.log(data);
											tixToAddCb(err)
										}
										console.log()
										ticketIds.push(ticket._id);
										tixToAddCb();
									});
								}, function(err) {
									if (err) {
										return respond(data);
									}
									console.log('save ticketIds to plan');
									console.log(ticketIds);
									/* now add the ticket to the plan */
									req.session.plan.tickets = ticketIds;
									req.session.plan.save(function(err) {
										if (err) {
											console.log(err);
											data.success = 0;
											data.dbError = 'unable to add ticketGroup ' + ticket.id;
										}
										return respond(data);
									});
								});
							} else {
								return respond(data);
							}
						});
					});
				} else {
					return respond(data);
				}
			});
		});
	},

	login: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		console.log(args);

		//validate email/password against the db
		Customer.findOne({
			email: args.email
		}, function(err, c) {
			if (err) {
				console.log('err finding customer');
				return me(err);
			}
			console.log(c);
			if (c != null) {
				//make a digest from the email
				var digest = wembliUtils.digest(args.password);
				if (typeof c.password !== "undefined" && c.password == digest) {
					req.session.loggedIn = true;
					req.session.customer = c;
					req.session.rememberEmail = c.email;
					data.customer = c;

					return me(null, data);
				}

				if (typeof c.password === "undefined") {

					data.noPassword = true;
					data.error = true;
					/* send forgot password email */
					var noToken = true;

					/* have a c, make a forgot password token (or if there is already one in the db that is not expired, use it) */
					if (typeof c.forgotPassword[0] != "undefined") {
						/* check if this token is expired */
						var dbTimestamp = c.forgotPassword[0].timestamp;
						var currentTimestamp = new Date().getTime();
						var timePassed = (currentTimestamp - dbTimestamp) / 1000;
						//has it been more than 2 days?
						var noToken = (timePassed < 172800) ? false : true;
					}

					if (noToken) {
						//make a new token
						var tokenTimestamp = new Date().getTime().toString();
						var tokenHash = wembliUtils.digest(args.email + tokenTimestamp);
					} else {
						//use the existing token
						var tokenHash = c.forgotPassword[0].token;
						var tokenTimestamp = c.forgotPassword[0].timestamp;
					}

					var forgotPassword = [{
						timestamp: tokenTimestamp,
						token: tokenHash
					}];

					c.update({
						forgotPassword: forgotPassword
					}, function(err) {
						if (err) {
							return me('dbError: error updating forgotPassword Token');
						}

						var mailArgs = {
							res: res,
							req: req,
							tokenHash: tokenHash,
							customer: c,
							next: args.next
						}

						wembliMail.sendForgotPasswordEmail(mailArgs)
						return me(null, data);
					});
				} else {
					if (c.password != digest) {
						return me(null, {
							success: 0,
							error: true,
							invalidCredentials: true
						});
					}
				}
			} else {
				return me(null, {
					success: 0,
					error: true,
					invalidCredentials: true
				});
			}
		}, false);
	},

	resetPassword: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		console.log(args);

		if (!args.password || (args.password !== args.password2)) {
			data.passwordMismatch = true;
			data.success = 0;
			return me(null, data);
		}

		//validate email/password against the db
		Customer.findOne({
			email: args.email
		}, function(err, c) {
			if (err) {
				console.log('err finding customer');
				return me(err);
			}

			if (c == null) {
				return me('no customer');
			}

			if (typeof c.forgotPassword == "undefined") {
				//no crystal
				return me('forgot password not initiated');
			}

			console.log('customer');
			console.log(c);
			//check if this token is expired
			var dbTimestamp = c.forgotPassword[0].timestamp;
			var currentTimestamp = new Date().getTime();
			var timePassed = (currentTimestamp - dbTimestamp) / 1000;
			//has it been more than 2 days?
			if (timePassed > 172800) {
				data.success = 0;
				data.expired = true;
				return me(null, data);
			}

			//make sure the passed in token matches the db token
			if (args.token != c.forgotPassword[0].token) {
				data.success = 0;
				data.tokenMismatch = true;
				return me(null, data);
			}

			var password = wembliUtils.digest(args.password);
			var forgotPassword = [];
			var confirmed = true;
			c.update({
				forgotPassword: [],
				password: password,
				confirmed: confirmed
			}, function(err) {
				//log em in
				req.session.loggedIn = true;
				req.session.customer = c;
				console.log('successfully set password');
				return me(null, data);
			});
		});
	},

	sendConfirmationEmail: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		if (!req.session.customer.email) {
			data.error = true;
			data.success = 0;
			data.noEmail = true;
			return me(null, data);
		}

		//fetch the customer by email
		Customer.findOne({
			email: req.session.customer.email
		}, function(err, c) {
			//error happened
			if (err) {
				data.success = 0;
				return me(err, data);
			}

			//customer exists
			if (c !== null) {
				//they've already signed up
				data.exists = true;
				if (typeof c.password === "undefined") {
					/* send forgot password email */
					data.noPassword = true;
					data.error = true;
					/* send forgot password email */
					var noToken = true;

					/* have a c, make a forgot password token (or if there is already one in the db that is not expired, use it) */
					if (typeof c.forgotPassword[0] != "undefined") {
						/* check if this token is expired */
						var dbTimestamp = c.forgotPassword[0].timestamp;
						var currentTimestamp = new Date().getTime();
						var timePassed = (currentTimestamp - dbTimestamp) / 1000;
						//has it been more than 2 days?
						var noToken = (timePassed < 172800) ? false : true;
					}

					if (noToken) {
						//make a new token
						var tokenTimestamp = new Date().getTime().toString();
						var tokenHash = wembliUtils.digest(req.session.customer.email + tokenTimestamp);
					} else {
						//use the existing token
						var tokenHash = c.forgotPassword[0].token;
						var tokenTimestamp = c.forgotPassword[0].timestamp;
					}

					var forgotPassword = [{
						timestamp: tokenTimestamp,
						token: tokenHash
					}];

					c.update({
						forgotPassword: forgotPassword
					}, function(err) {
						if (err) {
							return me('dbError: error updating forgotPassword Token');
						}

						var mailArgs = {
							res: res,
							req: req,
							tokenHash: tokenHash,
							customer: c,
							next: args.next
						}

						wembliMail.sendForgotPasswordEmail(mailArgs, function() {
							return me(null, data);
						});
					});
				} else {
					/* there is a password, so just send the confirmation email again... */
					if (typeof c.confirmation[0] != "undefined") {

						/* check if this token is expired */
						var dbTimestamp = c.confirmation[0].timestamp;
						var currentTimestamp = new Date().getTime();
						var timePassed = (currentTimestamp - dbTimestamp) / 1000;
						//has it been more than 2 days?
						var noToken = (timePassed < 172800) ? false : true;
					}

					if (noToken) {
						//make a new token
						var tokenTimestamp = new Date().getTime().toString();
						var tokenHash = wembliUtils.digest(req.session.customer.email + tokenTimestamp);
					} else {
						//use the existing token
						var tokenHash = c.confirmation[0].token;
						var tokenTimestamp = c.confirmation[0].timestamp;
					}

					c.confirmation[0] = {
						timestamp: tokenTimestamp,
						token: tokenHash
					};


					c.save(function(err) {
						if (err) {
							data.success = 0;
							return me(err, data);
						}

						req.session.loggedIn = true;
						req.session.customer = c;

						/* send signup email async */
						wembliMail.sendSignupEmail({
							res: res,
							req: req,
							confirmationToken: tokenHash,
							customer: c,
							next: args.next
						}, function() {
							return me(null, data);
						});
					});
				}
			} else {
				/* no customer to send confirmation email to */
				data.success = 0;
				data.error = true;
				data.noCustomer = true;
				return me(null, data);
			}

		});

	},

	sendForgotPasswordEmail: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		/* check the forgot password token for this email */
		Customer.findOne({
			email: args.email
		}, function(err, c) {
			if (err) {
				return me(err);
			}
			if (c === null) {
				data.success = 0;
				data.error = true;
				data.noCustomer = true;
				return me(null, data);
			}
			/* send forgot password email */
			var noToken = true;

			/* have a c, make a forgot password token (or if there is already one in the db that is not expired, use it) */
			if (typeof c.forgotPassword[0] != "undefined") {
				/* check if this token is expired */
				var dbTimestamp = c.forgotPassword[0].timestamp;
				var currentTimestamp = new Date().getTime();
				var timePassed = (currentTimestamp - dbTimestamp) / 1000;
				/* has it been more than 2 days? */
				var noToken = (timePassed < 172800) ? false : true;
			}

			if (noToken) {
				//make a new token
				var tokenTimestamp = new Date().getTime().toString();
				var tokenHash = wembliUtils.digest(args.email + tokenTimestamp);
			} else {
				//use the existing token
				var tokenHash = c.forgotPassword[0].token;
				var tokenTimestamp = c.forgotPassword[0].timestamp;
			}

			var forgotPassword = [{
				timestamp: tokenTimestamp,
				token: tokenHash
			}];

			c.update({
				forgotPassword: forgotPassword
			}, function(err) {
				if (err) {
					return me('dbError: error updating forgotPassword Token');
				}

				var mailArgs = {
					res: res,
					req: req,
					tokenHash: tokenHash,
					customer: c,
					next: args.next
				}
				wembliMail.sendForgotPasswordEmail(mailArgs)
				return me(null, data);
			});

		}, false);
	},

	//some methodsi should probably make:
	get: function(args, req, res) {
		//if no customerId then return the customer for this session
	},

	//get all the plans this customer is organizing
	getPlans: function(args, req, res) {

	},

	//get all the plans this customer is invited to
	getPlansInvitedTo: function(args, req, res) {

	},

	notify: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		if (args.email && req.session.plan) {
			var newNotify = {
				email: args.email,
				addOn: args.addOn,
				event: req.session.plan.event.data
			};
			var notify = new Notify(newNotify);
			notify.save(function(err) {
				return me(null, data);
			});

		}

	}


	/* do i need this? 20120917
	ezxxists: function(email) {
		var me = this;

		Customer.findOne({
			email: email
		}, function(err, c) {
			var valid = (c == null) ? 0 : 1;
			me(null, valid);
		});

	}
	*/
}
