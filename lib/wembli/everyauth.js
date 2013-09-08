var wembliModel = require('wembli-model'),
	Customer = wembliModel.load('customer');
var wembliEmail = require('wembli/email');

var conf = {
	fb: {
		appId: '314732478586428',
		appSecret: '68b80c2adfd5421b6c9df85751264d4e'
	},
	twit: {
		appId: 'aGekerxvrd9RczHHEOLEw',
		appSecret: 'PUdQVzslAATiRCFhTXetmjbaFGoWIM092bSkuulFdk'
	}
}


module.exports = {
	conf: conf,

	init: function(ea) {
		ea.debug = true;

		ea.everymodule.findUserById(function(req, id, callback) {
			console.log('findbyuserid:'+id);

			Customer.findOne({"socialProfiles.facebook.id":id}, function(err, c) {
				if(err) {
					return callback(err);
				}

				if (c !== null) {
					req.session.customer = c;
				}
				callback(null, c);
			});
		});


		ea.everymodule.handleLogout(function(req, res) {
			req.session.secure = false;
			req.session.loggedIn = false;
			delete req.session.plan;
			delete req.session.customer;
			delete req.session.redirectUrl;
			delete req.session.loginRedirect;
			req.logout();
			console.log('logged out yo!');
			return res.redirect((req.param('redirectUrl') ? req.param('redirectUrl') : '/'));
		});


		console.log('host: ' + app.settings.host);
		var redirectUrl = (app.settings.host == 'tom') ? 'http://tom.wembli.com/login/social' : 'https://www2.wembli.com/login/social';

		/* twitter auth */
		ea.twitter.consumerKey(conf.twit.appId).consumerSecret(conf.twit.appSecret).callbackPath('/auth/twitter/callback').handleAuthCallbackError(function(req, res) {

			req.flash('error', 'Unable to login via twitter, please login manually.');
			res.redirect('/');

		}).findOrCreateUser( function (session, accessToken, accessSecret, user, data) {

			var res     = data.res;
			var promise = this.Promise();

			if(typeof user == "undefined") {
				promise.fail('no user found');
			}

			session.loginRedirect = true;
			if (typeof session.twitter === "undefined") {
				session.twitter = {};
			}
			session.twitter.accessToken  = accessToken;
			session.twitter.accessSecret = accessSecret;
			session.twitter.profile      = user;
			console.log(session.twitter);
			/* if this customer is logged in, we don't want to overwrite their current email with their twitter email */
			if (session.customer) {
				console.log('customer is logged in - just set the twitter profile and gtfo');
				console.log('session. is');
				if (typeof session.customer.socialProfiles === "undefined") {
					session.customer.socialProfiles = {twitter:user};
				} else {
					session.customer.socialProfiles.twitter = user;
				}
				session.customer.save(function(err) {
					console.log('updated customer to add twitter social profile');
					console.log('err'+err);
					session.loggedIn = true;
					console.log(session.customer);
					promise.fulfill(user);
				});
				return promise;
			}

			/* now check for an existing cust record for this twitter profile */
			Customer.findOne({"socialProfiles.twitter.id":user.id_str},function(err,c) {
				if(c != null) {
					/*
					already have a customer for this email or profile?
					- save the profile then log them in
					*/

					c.update({"socialProfiles.twitter":user},function(err) {
						/* TODO: log errors */
						session.customer = c;
						session.loggedIn = true;
						console.log('logged in via twitter!');
						promise.fulfill(user);
					});
				}
				return promise.fulfill(user);
			});

			return promise;

    }).redirectPath(redirectUrl);



		/* facebook auth */
		ea.facebook.appId(conf.fb.appId).appSecret(conf.fb.appSecret).handleAuthCallbackError(function(req, res) {
			console.log('facebook auth callback error: ');
			/*
		 If a user denies your app, Facebook will redirect the user to
		 /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
		 This configurable route handler defines how you want to respond to
		 that.
		 If you do not configure this, everyauth renders a default fallback
		 view notifying the user that their authentication failed and why.
		 */
			req.flash('error', 'Unable to login via facebook, please login manually.');
			res.redirect('/');
		}).findOrCreateUser(function (session, accessToken, accessTokenExtra, user, data) {
			var me = this;
			var res = data.res;
			var promise = this.Promise();

			if(typeof user == "undefined") {
				promise.fail('no user found');
			}
			console.log('got a user: ');
			console.log(user);
			session.loginRedirect = true;
			if (typeof session.facebook === "undefined") {
				session.facebook = {};
			}
			session.facebook.accessToken = accessToken;
			session.facebook.accessTokenExtra = accessTokenExtra;
			session.facebook.profile = user;

			/* if this customer is logged in, we don't want to overwrite their current email with their fb email */
			if (session.customer) {
				console.log('customer is logged in - just set the facebook profile and gtfo');
				console.log('session. is');
				if (typeof session.customer.socialProfiles === "undefined") {
					session.customer.socialProfiles = {facebook:user};
				} else {
					session.customer.socialProfiles.facebook = user;
				}
				session.customer.save(function(err) {
					console.log('updated customer to add facebook social profile');
					console.log('err'+err);
					session.loggedIn = true;
					console.log(session.customer);
					promise.fulfill(user);
				});
				return promise;
			}
			console.log('customer not logged in find it in the db or create one');
			/* now check for an existing cust record for this facebook profile */
			Customer.findOne({"$or":[{"email":user.email},{"socialProfiles.facebook.id":user.id}]},function(err,c) {
				if(c != null) {
					/*
					already have a customer for this email or profile?
					- save the profile then log them in
					*/

					c.update({"socialProfiles.facebook":user},function(err) {
						/* TODO: log errors */
						session.customer = c;
						session.loggedIn = true;
						console.log('logged in via facebook');
						promise.fulfill(user);
					});
					return;
				}

				console.log('new customer from facebook');
				var newC = {
					email: user.email,
					firstName: user.first_name,
					lastName: user.last_name,
					confirmed: true
				};

				/* if there's ipinfo in the session grab the zip */
				if(typeof session.visitor.tracking != "undefined") {
				    console.log(session.visitor.tracking);
					if(/\d+/.test(session.visitor.tracking.postalCode)) {
						newC.postalCode = session.visitor.tracking.postalCode;
					}
				}

				var customer = new Customer(newC);
				customer.socialProfiles.facebook = user;

				/* make a confirmation token */
				var confirmation = Customer.makeConfirmation(user.email);
				customer.confirmation.push(confirmation);

				customer.save(function(err) {

					session.loggedIn = true;
					session.customer = customer;

					/* send signup email */
					var args = {
						res: res,
						confirmationToken: confirmation.token,
						customer: customer,
					}
					wembliEmail.sendWelcomeEmail(args);

					/* if they have a plan, save it */
					if (typeof session.plan !== "undefined") {
						/* sanity check - make sure this plan does not have an organizer */
						if (session.plan.organizer.customerId) {	return respond(data);	}

						/* this plan does not yet have an organizer whew! */
						session.plan.organizer.customerId  = customer.id;
						session.visitor.context = 'organizer';

						console.log('plan.organizer: ');
						console.log(session.plan);
						session.plan.save(function(err) {
							console.log('saved plan: ' + session.plan.id);
							console.log('add plan to customer')
							customer.addPlan(session.plan.guid, function(err) {
								console.log('added a plan to customer..');
							});
						});
					}

					console.log('fulfilling promise');
					promise.fulfill(user);
				});
			});

			return promise;
		}).scope('email,user_events,friends_events,user_location,friends_location,read_friendlists,create_event,manage_friendlists,publish_checkins,publish_stream,rsvp_event').redirectPath(redirectUrl);
	}
};
