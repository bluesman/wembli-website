var querystring = require('querystring');
var fs = require('fs');
var wembliMail = require('wembli/email');
var wembliUtils = require('wembli/utils');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Plan = wembliModel.load('plan');
var Feed = wembliModel.load('feed');

exports.customer = {
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
			req.session.signupForm.firstName = data.firstName ? data.firstName : req.session.signupForm.firstName;
			req.session.signupForm.lastName = data.lastName ? data.lastName : req.session.signupForm.lastName;
			req.session.signupForm.email = data.email ? data.email : req.session.signupForm.email;
			req.session.signupForm.formError = data.formError;
			req.session.signupForm.exists = data.exists;
			req.session.signupForm.loginRedirect = data.loginRedirect ? data.loginRedirect : req.session.loginRedirect;
			req.session.signupForm.redirectUrl = data.redirectUrl ? data.loginRedirect : req.session.redirectUrl;
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
			if (/\d+/.test(req.session.ipinfo.zipCode)) {
				newC.zip_code = req.session.ipinfo.zipCode;
			}

			var customer = new Customer(newC);

			//console.log(customer);
			var createCustomer = function() {
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
					/* sanity check - make sure this plan does not have an organizer */
					if (req.session.plan.organizer) {
						return respond(data);
					}

					/* this plan does not yet have an organizer whew! */
					req.session.plan.organizer = customer.id;
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
				});
			};

			//if there's a token in the session it means they came from an email invite url
			//check to make sure there is a friend with this token
			console.log('token is: ' + req.session.visitor.token);
			if (req.session.visitor.token) {
				console.log('signup with a token:' + req.session.visitor.token);
				Customer.findFriendEmailByFriendToken(req.session.visitor.token, function(err, email) {
					if (email && (email == args.email)) {
						//confirmation should be true
						customer.confirmed = true;
					}
					createCustomer();
				});
			} else {
				console.log('signup with out a token:' + req.session.visitor.token);
				createCustomer();
			}
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
						return me(null,data);
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
		var data = {success: 1};

		console.log('sending forgotPassword email');
		console.log(args);
		/* check the forgot password token for this email */
		Customer.findOne({
			email: args.email
		}, function(err, c) {
			if (err) {return me(err);	}
			if (c === null ) {
				data.error = true;
				data.noCustomer = true;
				return me(null,data);
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
				wembliMail.sendForgotPasswordEmail(mailArgs)
				return me(null,data);
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
