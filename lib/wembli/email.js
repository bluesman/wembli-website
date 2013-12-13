var mailer = require("./sendgrid");
var wembliModel = require('../wembli-model');
var Customer = wembliModel.load('customer');

var wembliSupport = '"Wembli Support" <help@wembli.com>';
var defaultCb = function(error, success) {
};

var sendEmail = function(args, callback) {
	args.res.render(args.template, args.templateArgs, function(err, htmlStr) {
		var mail = {
			from: args.from,
			to: args.to,
			headers: {
				'X-SMTPAPI': JSON.stringify(args.smtpapiHeader)
			},
		};

		if (args.cc) {
			mail.cc = args.cc;
		}

		mail.subject = args.subject;
		//templatize this
		mail.text = args.text;
		mail.html = htmlStr;
		mailer.sendMail(mail, callback);
	});

}

module.exports = {
	'sendForgotPasswordEmail': function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;
		/* send an email with the link */
		var resetLink = "http://" + app.settings.host + ".wembli.com/reset-password";
		var emailEsc = encodeURIComponent(args.customer.email);
		var tokenEsc = encodeURIComponent(args.tokenHash);

		var redirect = '';
		if (typeof args.next !== "undefined") {
			var redirect = encodeURIComponent(args.next);
		}
		var resetLinkEncoded = resetLink + '/' + emailEsc + '/' + tokenEsc + '?next=' + redirect;

		var sendArgs = {
			res: args.res,
			template: 'email-templates/forgot-password',
			templateArgs: {
				resetLink: resetLinkEncoded,
				layout: 'email-templates/layout',
				token: args.tokenHash,
				c: args.customer,
				req: args.req
			},
			from: wembliSupport,
			to: args.customer.email,
			smtpapiHeader: {
				category: "forgot-password",
			},
			subject: "Reset Your Password",
			text: 'Click here to reset your password: ' + resetLinkEncoded
		}
		sendEmail(sendArgs, callback);
	},

	'sendPonyUpEmail': function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;
		var alternateText = args.friend.contactInfo.name + ', Pony Up for your share! You owe: ' + args.payment.amount;

		var payLink = "http://" + app.settings.host + ".wembli.com/plan/"+args.req.session.plan.guid+'/4';

		/* look the customer up for this friend */
		Customer.findById(args.friend.customerId, function(err, customer) {
			if (err) {
				return callback(err);
			}

			if(customer === null) {
				return callback('no customer for this friend');
			}

			var sendArgs = {
				'res': args.res,
				'template': 'email-templates/collect-payment',
				'templateArgs': {
					layout: 'email-templates/layout',
					req: args.req,
					payment: args.payment,
					friend: args.friend,
					payLink: payLink
				},
				'from': wembliSupport,
				'to': customer.email,
				'smtpapiHeader': {
					category: 'pony-up-request',
					unique_args: {
						paymentId: args.payment._id,
						friendId: args.friend._id,
						planGuid: args.friend.planGuid
					}
				},
				'subject': "It's Time To Pony Up!",
				'text': alternateText,
			};
			sendEmail(sendArgs, callback);
		});
	},

	'sendWelcomeEmail': function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;
		var alternateText = 'Welcome to wembli! Thanks for joining!';
		var sendArgs = {
			'res': args.res,
			'template': 'email-templates/welcome',
			'templateArgs': {
				layout: 'email-templates/layout',
				req: args.req
			},
			'from': wembliSupport,
			'to': args.customer.email,
			'smtpapiHeader': {
				category: 'welcome'
			},
			'subject': "Welcome to Wembli.com",
			'text': alternateText,
		};
		sendEmail(sendArgs, callback);
	},

	'sendRSVPEmail': function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;
		var req = args.req;
		var alternateText = req.session.customer.firstName + ' ' + req.session.customer.lastName + ' has invited you to an outing using Wembli! \n\r' + args.message + '\n\rFollow the link to see the details and RSVP.\n\r' + args.rsvpLink;
		var sendArgs = {
			'res': args.res,
			'template': 'email-templates/rsvp',
			'templateArgs': {
				layout: 'email-templates/layout',
				rsvpDate: args.rsvpDate,
				rsvpLink: args.rsvpLink,
				friendName: args.friendName,
				message: args.message,
				req: args.req
			},
			'from': wembliSupport,
			'to': args.email,
			//'cc': req.session.customer.email,
			'smtpapiHeader': {
				category: 'rsvp',
				unique_args: {
					friendId: args.friendId,
					planGuid: args.planGuid
				}
			},
			'subject': "Invitation From " + req.session.customer.firstName + ' ' + req.session.customer.lastName,
			'text': alternateText,
		};
		sendEmail(sendArgs, callback);
	},

	'sendSignupEmail': function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;
		var confirmLink = "http://" + app.settings.host + ".wembli.com/confirm";
		var emailEsc = encodeURIComponent(args.customer.email);
		var tokenEsc = encodeURIComponent(args.customer.confirmation[0].token);
		var next = (typeof args.next !== "undefined") ? encodeURIComponent(args.next) : encodeURIComponent('/dashboard');
		var nextEsc = encodeURIComponent(next);
		var confirmLinkEncoded = confirmLink + '/' + emailEsc + '/' + tokenEsc + '?next=' + nextEsc;
		var alternateText = 'Thanks for joining wembli! ';
		if (args.promo) {
			alternateText += 'Your promo code is: '+args.promo.toUpperCase();
		}
		alternateText += 'Click here to confirm your email address: ' + confirmLink + '/' + emailEsc + '/' + tokenEsc + '?next=' + nextEsc;

		var sendArgs = {
			'res': args.res,
			'template': 'email-templates/signup',
			'templateArgs': {
				layout: 'email-templates/layout',
				confirmLink: confirmLinkEncoded,
				req: args.req,
				promo: args.promo
			},
			'from': wembliSupport,
			'to': args.customer.email,
			'smtpapiHeader': {
				category: 'signup'
			},
			'subject': "Welcome to Wembli.com",
			'text': alternateText,
		};
		sendEmail(sendArgs, function(e,s) {
			/* also send an email to team notifying of a new signup */
			sendArgs.to = 'team@wembli.com';
			sendArgs.template = 'email-templates/new-customer';
			sendEmail(sendArgs, function() {
				callback(e,s);
			});
		});

	},
	'sendRsvpChanged': function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;
		var alternateText = 'Your ears must be ringing ‘cause your guests are talking about your invitation to '+args.plan.event.eventName+'!  Check out who’s just RSVP’d by clicking here: https://www.wembli.com/plan/'+args.plan.guid+'/1';
		var sendArgs = {
			'res': args.res,
			'template': 'email-templates/rsvp-changed',
			'templateArgs': {
				layout: 'email-templates/layout',
				plan: args.plan,
				organizer: args.organizer,
				req: args.req,
			},
			'from': wembliSupport,
			'to': args.organizer.email,
			'smtpapiHeader': {
				category: 'rsvp-changed'
			},
			'subject': args.req.session.customer.firstName + " RSVP'd to your plan",
			'text': alternateText,
		};

		sendEmail(sendArgs, callback);
	},
	'sendRsvpComplete': function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;
		var alternateText = 'Heads up!  Your RSVP just expired for '+args.plan.event.eventName+'.  Click the url to put tickets in your cart and send a pony up to your friends.  Remember, tickets aren’t locked in until they’re paid for. https://www.wembli.com/dashboard';

		var sendArgs = {
			'res': args.res,
			'template': 'email-templates/rsvp-complete',
			'templateArgs': {
				layout: 'email-templates/layout',
				plan: args.plan,
				customer: args.customer,
				req: args.req,
			},
			'from': wembliSupport,
			'to': args.customer.email,
			'smtpapiHeader': {
				category: 'rsvp-complete'
			},
			'subject': "Your RSVP expired",
			'text': alternateText,
		};

		sendEmail(sendArgs, callback);
	}
};
