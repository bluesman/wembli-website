var querystring = require('querystring');
var fs = require('fs');
var wembliEmail = require('wembli/email');
var wembliUtils = require('wembli/utils');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Plan = wembliModel.load('plan');
var Feed = wembliModel.load('feed');

module.exports = function(app) {

	app.get('/signup', function(req, res) {
		res.render('signup', {
			title: 'wembli.com - Signup now.',
		});
	});

	app.post(/\/signup\/?/, function(req, res) {

		/* TODO - have this use rpc signup */

		req.session.signupForm = {
			firstName: req.param('firstName'),
			lastName:  req.param('lastName'),
			email:     req.param('email'),
			formError: false,
			exists:    false
		};

		if (!req.param('email')) {
			req.session.signupForm.formError = true;
			return res.redirect('/signup');
		}

		//TODO: make sure passwords match
		if (!req.param('password') || !req.param('password2')) {
			req.session.signupForm.formError = true;
			return res.redirect('/signup');
		}

		if (req.param('password') != req.param('password2')) {
			req.session.signupForm.formError = true;
			return res.redirect('/signup');
		}


		//fetch the customer by email
		Customer.findOne({
			email: req.param('email')
		}, function(err, c) {

			//if no c make one email param
			if (c == null) {
				var digest = wembliUtils.digest(req.param('password'));

				var newC = {
					email: req.param('email'),
					firstName: req.param('firstName'),
					lastName: req.param('lastName'),
					password: digest,
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
					var digestKey = req.param('email') + confirmationTimestamp;
					var confirmationToken = wembliUtils.digest(digestKey);

					customer.confirmation.push({
						timestamp: confirmationTimestamp,
							token: confirmationToken
						});

					customer.save(function(err) {
						req.session.loggedIn = true;
						req.session.customer = customer;

						console.log('saved customer: ' + customer.id);
						req.session.plan.organizer = customer.id;
						console.log('plan.organizer: ');
						console.log(req.session.plan);
						req.session.plan.save(function(err) {
							console.log('saved plan: ' + req.session.plan.id);
							console.log('add plan to customer')
							customer.addPlan(req.session.plan.guid, function(err) {
								console.log('added a plan to customer..');
								req.session.visitor.context = 'organizer';

								/* send signup email */
								var args = {
									res: res,
									confirmationToken: confirmationToken,
									customer: customer,
								}
								wembliEmail.sendSignupEmail(args);
								/* if there is a redirectUrl, show a flash message indicating successful signup */
								var redirectUrl = '/dashboard';
								if (req.param('redirectUrl')) {
									redirectUrl = req.param('redirectUrl');
								}
								return res.redirect(redirectUrl);
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
						if (email && (email == req.param('email'))) {
							//confirmation should be true
							customer.confirmed = true;
						}
						createCustomer();
					});
				} else {
					console.log('signup with out a token:' + req.session.visitor.token);
					createCustomer();
				}

			} else {
				//they've already signed up
				req.session.signupForm.exists = true;
				return res.redirect('/signup');
			}

		});

	});

};
