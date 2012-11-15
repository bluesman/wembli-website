var querystring = require('querystring');
var fs = require('fs');
var mailer = require("../lib/wembli/sendgrid");
var wembliUtils = require('wembli/utils');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Feed = wembliModel.load('feed');

module.exports = function(app) {

	app.get('/signup', function(req, res) {
		res.render('signup', {
			title: 'wembli.com - Signup now.',
		});
	});

	app.post(/\/signup\/?/, function(req, res) {

		req.session.signupForm = {
			firstName: req.param('first_name'),
			lastName:  req.param('last_name'),
			email:     req.param('email'),
			error:     false,
			exists:    false
		};

		if (!req.param('email')) {
			req.session.signupForm.error = true;
			return res.redirect('/signup');
		}

		//TODO: make sure passwords match
		if (!req.param('password') || !req.param('password2')) {
			req.session.signupForm.error = true;
			return res.redirect('/signup');
		}

		if (req.param('password') != req.param('password2')) {
			req.session.signupForm.error = true;
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
					first_name: req.param('first_name'),
					last_name: req.param('last_name'),
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

						console.log('saving currentplan after signup:');
						console.log(req.session);

						if ((req.session.isOrganizer != "undefined") && (req.session.isOrganizer)) {
							customer.eventplan.push(req.session.currentPlan);
						}

						customer.save(function(err) {
							//console.log('customer save err: '+err);
							//iterate through customer.properties
							//for each prop: customer.prop = (c.prop ? c.prop : ((typeof result.prop != 'undefined') ? result.prop : null));
							req.session.loggedIn = true;
							req.session.customer = customer;

							//send a confirmation email
							var confirmLink = "http://" + app.settings.host + ".wembli.com/confirm";
							var emailEsc = encodeURIComponent(req.session.customer.email);
							var tokenEsc = encodeURIComponent(req.session.customer.confirmation[0].token);
							var confirmLinkEncoded = confirmLink + '/' + emailEsc + '/' + tokenEsc;

							//send the email asynchronously
							res.render('email-templates/signup', {
								confirmLink: confirmLinkEncoded,
								layout: 'email-templates/layout',
							}, function(err, htmlStr) {
								var mail = {
									from: '"Wembli Support" <help@wembli.com>',
									to: req.session.customer.email,
									headers: {
										'X-SMTPAPI': {
											category: "signup",
										}
									},

								};

								mail.subject = "Welcome to Wembli.com";
								//templatize this
								mail.text = 'Click here to confirm your email address: http://' + app.settings.host + '.wembli.com/confirm/' + encodeURIComponent(req.session.customer.email) + '/' + encodeURIComponent(confirmationToken);
								mail.html = htmlStr;
								mailer.sendMail(mail, function(error, success) {
									console.log("Message " + (success ? "sent" : "failed:" + error));
								});

							});

							//if there is a redirectUrl, show a flash message indicating successful signup
							var redirectUrl = '/dashboard';
							if (req.param('redirectUrl')) {
								//req.flash('info','Signup was successful and your work was saved.');
								redirectUrl = req.param('redirectUrl');
							}
							return res.redirect(redirectUrl);
						});
					};

				//if there's a token in the session it means they came from an email invite url
				//check to make sure there is a friend with this token
				console.log('token is: ' + req.session.token);
				if (req.session.token) {
					console.log('signup with a token:' + req.session.token);
					Customer.findFriendEmailByFriendToken(req.session.token, function(err, email) {
						if (email && (email == req.param('email'))) {
							//confirmation should be true
							customer.confirmed = true;
						}
						createCustomer();
					});
				} else {
					console.log('signup with out a token:' + req.session.token);

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
