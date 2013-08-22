var querystring = require('querystring');
var fs = require('fs');
var wembliMail = require('wembli/email');
var wembliUtils = require('wembli/utils');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Plan = wembliModel.load('plan');
var Feed = wembliModel.load('feed');
var balanced = require('wembli/balanced-api')({
	secret: app.settings.balancedSecret,
	marketplace_uri: app.settings.balancedMarketplaceUri
});

exports.customer = {
	updateAccountHolderInfo: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		console.log('update account holder info');
		console.log(args);

		/* make sure there is a customer */
		if (!req.session.customer) {
			data.success = 0;
			data.error = true;
			data.errorMessage = 'customer must be logged in';
			return me(null, data);
		}
		console.log(args);
		console.log(req.session.customer);

		var customer = new balanced.customers();
		customer.update(req.session.customer.balancedAPI.customerAccount.uri, args, function(err, bRes, bCustomer) {
			/* get bank accounts for this customer */
			customer.setContext(bCustomer);
			customer.listBankAccounts(function(err, bRes, bankAccounts) {
				console.log(bankAccounts);
				data.accountHolderInfo = bCustomer;
				data.bankAccounts = bankAccounts;
				console.log('req.session.customer');
				console.log(req.session);
				req.session.customer.balancedAPI.customerAccount = bCustomer;
				req.session.customer.balancedAPI.bankAccounts = bankAccounts;

				req.session.customer.markModified('balancedAPI');
				req.session.customer.save(function(err) {
					console.log('saved customer after update customer info');
					console.log(err);
					return me(null, data);
				});
			});
		});

	},

	addBankAccount: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		console.log('addBankAccount');
		console.log(args);

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
			console.log('added bank account');
			console.log(result);
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
				console.log(bankAccounts);
				data.bankAccount = result;
				data.bankAccounts = bankAccounts;
				req.session.customer.balancedAPI.customerAccount.bank_accounts = bankAccounts;
				req.session.customer.markModified('balancedAPI.customerAccount');
				req.session.customer.save(function(err) {
					console.log('saved customer after bank account added');
					console.log(err);
					return me(null, data);
				});
			});
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

		if (typeof req.session.customer.balancedAPI.merchantAccount === "undefined") {
			//there are not bank accounts
			data.bankAccounts = [];
			return me(null, data);
		}

		console.log(args);

		/* get a list of bank accounts for this merchant */
		var bAccount = new balanced.accounts();
		bAccount.listBankAccounts(req.session.customer.balancedAPI.merchantAccount.bank_accounts_uri, {}, function(err, bRes, bankAccounts) {
			/* find the matching bank account uri and delete it */
			var items = [];
			var deleted = false;
			bankAccounts.items.forEach(function(bank) {
				console.log(bank.uri);
				if (bank.uri == args.uri) {
					deleted = true;
					/* safe to delete this bank account */
					var bBank = new balanced.bank_accounts();
					bBank.delete(bank.uri, function(err, bRes, result) {
						//TODO check err
						bAccount.listBankAccounts(req.session.customer.balancedAPI.merchantAccount.bank_accounts_uri, {}, function(err, bRes, bankAccounts) {
							req.session.customer.balancedAPI.customerAccount.bank_accounts = bankAccounts;
							req.session.customer.markModified('balancedAPI.customerAccount');
							req.session.customer.save(function(err) {
								console.log('saved customer after bank account added');
								console.log(err);
								return me(null, data);
							});
						});
					});
				}
			});
			if (!deleted) {
				data.success = 0;
				data.error('did not find bank account to delete');
				return me(null, data);
			}
		});

	},
	listBankAccounts: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		console.log('customer.listBankAccounts');
		console.log(args);

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
			console.log('get customer for merchant account');
			console.log(customer);
			var custApi = api.Customers.nbalanced(customer);
			custApi.BankAccounts.list(args, function(err, ba) {
				console.log('list of bank accounts for customer');
				console.log(ba);
				data.bankAccounts = ba;
				return me(null, data);
			});
		});
	},

	createMerchantAccount: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};
		console.log('customer.createMerchantAccount');
		console.log(args);

		/* save the customer and respond when all is done */
		var saveCustomer = function(bCustomer) {
			console.log('created customer account');
			console.log(bCustomer);
			var customer = new balanced.customers(bCustomer);
			customer.listBankAccounts(function(err, bRes, bankAccounts) {
				console.log('bank accounts');
				console.log(bankAccounts);
				data.accountHolderInfo = bCustomer;
				data.bankAccounts = bankAccounts;
				req.session.customer.balancedAPI.customerAccount = bCustomer;
				req.session.customer.balancedAPI.bankAccounts = bankAccounts;

				req.session.customer.markModified('balancedAPI.customerAccount');
				req.session.customer.markModified('balancedAPI.bankAccounts');
				req.session.customer.save(function(err) {
					console.log('saved customer after update customer info');
					console.log(err);
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

		console.log(person);

		var customers = new balanced.customers();
		customers.create(person, function(err, bRes, bCustomer) {
			if (bRes.statusCode != 201) {
				console.log(bCustomer);
				switch (bCustomer.status_code) {
					case 300:
						break;
					case 400:
						break;
					case 409:
						console.log('account exists...getting it');
						/* get account data by account_uri */
						/* update account data */
						customers.update(bCustomer.extras.account_uri, person, function(err, bRes, updateResponse) {
							console.log('update to customer account');
							console.log(updateResponse);
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
		console.log('customer.signup args');
		console.log(args);

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

			console.log('responding customer.signup');
			console.log(req.session.signupForm);
			me(null, req.session.signupForm);
		};

		if (!args.email) {
			data.formError = true;
			return respond(data);
		}

		//fetch the customer by email
		Customer.findOne({
			email: args.email
		}, function(err, c) {
			//error happened
			if (err) {
				data.success = 0;
				console.log(err);
				return respond(data);
			}

			//customer exists
			if (c !== null) {
				//they've already signed up
				data.exists = true;
				console.log('customer signup - customer exists - what is password');
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
							console.log('error updating forgot password token');
							return me('dbError: error updating forgotPassword Token');
						}

						var mailArgs = {
							res: res,
							tokenHash: tokenHash,
							customer: c,
							next: args.next
						}

						console.log('sending forgotpassword email in customer.login');
						wembliMail.sendForgotPasswordEmail(mailArgs)
					});
				}
				console.log(data);
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

			//console.log(customer);
			var confirmationTimestamp = new Date().getTime().toString();
			var digestKey = args.email + confirmationTimestamp;
			var confirmationToken = wembliUtils.digest(digestKey);

			customer.confirmation.push({
				timestamp: confirmationTimestamp,
				token: confirmationToken
			});

			customer.save(function(err) {
				if (err) {
					data.success = 0;
					return respond(data);
				}

				req.session.loggedIn = true;
				req.session.customer = customer;

				/* send signup email async */
				wembliMail.sendSignupEmail({
					res: res,
					confirmationToken: confirmationToken,
					customer: customer,
					next: args.next
				});

				console.log('saved customer: ' + customer.id);

				if (typeof req.session.plan !== "undefined") {
					/* sanity check - make sure this plan does not have an organizer */
					if (req.session.plan.organizer.customerId) {
						return respond(data);
					}

					/* this plan does not yet have an organizer whew! */
					req.session.plan.organizer.customerId = customer.id;
					req.session.visitor.context = 'organizer';

					console.log('plan.organizer: ');
					console.log(req.session.plan);
					req.session.plan.save(function(err) {
						console.log('saved plan: ' + req.session.plan.id);
						console.log('add plan to customer')
						customer.addPlan(req.session.plan.guid, function(err) {
							console.log('added a plan to customer..');
							return respond(data);
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
		console.log('customer.login args');
		console.log(args);
		var data = {
			success: 1
		};

		//validate email/password against the db
		Customer.findOne({
			email: args.email
		}, function(err, c) {
			if (err) {
				return me(err);
			}

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
							console.log('error updating forgot password token');
							return me('dbError: error updating forgotPassword Token');
						}

						var mailArgs = {
							res: res,
							tokenHash: tokenHash,
							customer: c,
							next: args.next
						}

						console.log('sending forgotpassword email in customer.login');
						wembliMail.sendForgotPasswordEmail(mailArgs)
						console.log('returning data from customer.login');
						console.log(data);
						return me(null, data);
					});
				} else {
					if (c.password != digest) {
						console.log('password is not digest');
						return me(null, {
							success: 1,
							error: true,
							invalidCredentials: true
						});
					}
				}
			} else {
				return me(null, {
					success: 1,
					error: true,
					invalidCredentials: true
				});
			}
		}, false);
	},

	sendForgotPasswordEmail: function(args, req, res) {
		var me = this;
		var data = {
			success: 1
		};

		console.log('sending forgotPassword email');
		console.log(args);
		/* check the forgot password token for this email */
		Customer.findOne({
			email: args.email
		}, function(err, c) {
			if (err) {
				return me(err);
			}
			if (c === null) {
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
					console.log('error updating forgot password token');
					return me('dbError: error updating forgotPassword Token');
				}

				var mailArgs = {
					res: res,
					tokenHash: tokenHash,
					customer: c,
					next: args.next
				}
				console.log('forgot password mail args');
				console.log(mailArgs);
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

	}

	/* do i need this? 20120917
	ezxxists: function(email) {
		var me = this;
		console.log(email);

		Customer.findOne({
			email: email
		}, function(err, c) {
			var valid = (c == null) ? 0 : 1;
			me(null, valid);
		});

	}
	*/
}
