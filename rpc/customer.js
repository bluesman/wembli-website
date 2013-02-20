var querystring = require('querystring');
var fs = require('fs');
var wembliEmail = require('wembli/email');
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

		if(typeof req.session.signupForm === "undefined") {
			req.session.signupForm = {};
		};

		var data = {
			success: 1,
			firstName: null,
			lastName: null,
			password: null,
			password2: null,
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
				console.log('responding customer.signup');
				console.log(req.session.signupForm);
				me(null, req.session.signupForm);
			};

		if(!args.email) {
			data.formError = true;
			return respond(data);
		}

		if(!args.password || !args.password2) {
			data.formError = true;
			return respond(data);
		}

		if(args.password != args.password2) {
			data.formError = true;
			return respond(data);
		}

		//fetch the customer by email
		Customer.findOne({
			email: args.email
		}, function(err, c) {
			//error happened
			if(err) {
				data.success = 0;
				console.log(err);
				return respond(data);
			}

			//customer exists
			if(c !== null) {
				//they've already signed up
				data.exists = true;
				data.formError = true;
				return respond(data);
			}

			//if no c make one email param
			var digest = wembliUtils.digest(args.password);

			var newC = {
				email: args.email,
				firstName: args.firstName,
				lastName: args.lastName,
				password: digest,
				confirmed: false
			};

			//if there's ipinfo in the session grab the zip
			if(/\d+/.test(req.session.ipinfo.zipCode)) {
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
					if(err) {
						data.success = 0;
						return respond(data);
					}

					req.session.loggedIn = true;
					req.session.customer = customer;

					/* send signup email async */
					wembliEmail.sendSignupEmail({
						res: res,
						confirmationToken: confirmationToken,
						customer: customer
					});

					console.log('saved customer: ' + customer.id);
					/* sanity check - make sure this plan does not have an organizer */
					if (req.session.plan.organizer) {	return respond(data);	}

					/* this plan does not yet have an organizer whew! */
					req.session.plan.organizer  = customer.id;
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
			if(req.session.visitor.token) {
				console.log('signup with a token:' + req.session.visitor.token);
				Customer.findFriendEmailByFriendToken(req.session.visitor.token, function(err, email) {
					if(email && (email == args.email)) {
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
