var mailer = require("./sendgrid");

var wembliSupport = '"Wembli Support" <help@wembli.com>';
var defaultCb = function(error, success) {
		console.log("Message " + (success ? "sent" : "failed:" + error));
	};

var sendEmail = function(args, callback) {
		args.res.render(args.template, args.templateArgs, function(err, htmlStr) {
			console.log('rendering email temaplte');
			console.log(err);
			console.log(htmlStr);

			var mail = {
				from: args.from,
				to: args.to,
				headers: {
					'X-SMTPAPI': args.smtpapiHeader
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
	'sendForgotPasswordEmail' : function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;
		/* send an email with the link */
		var resetLink        = "http://" + app.settings.host + ".wembli.com/reset-password";
		var emailEsc         = encodeURIComponent(args.customer.email);
		var tokenEsc         = encodeURIComponent(args.tokenHash);

		var redirect = '';
		if (typeof args.next !== "undefined") {
			var redirect				 = encodeURIComponent(args.next);
		}
		var resetLinkEncoded = resetLink + '/' + emailEsc + '/' + tokenEsc + '?next=' + redirect;

		var sendArgs = {
			res:args.res,
			template:'email-templates/forgot-password',
			templateArgs : {
				resetLink: resetLinkEncoded,
				layout:'email-templates/layout',
				token: args.tokenHash,
				c: args.customer,
				req:args.req
			},
			from: wembliSupport,
			to:args.customer.email,
			smtpapiHeader: {
				category:"forgot-password",
			},
			subject:"Reset Your Password",
			text:'Click here to reset your password: ' + resetLinkEncoded
		}
		sendEmail(sendArgs,callback);
	},

	'sendWelcomeEmail': function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;
		var alternateText = 'Welcome to wembli! Thanks for joining!';
		var sendArgs = {
			'res':args.res,
			'template': 'email-templates/welcome',
			'templateArgs': {
				layout: 'email-templates/layout',
				req:args.req
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
		var alternateText = req.session.customer.firstName + ' ' +req.session.customer.lastName+' has invited you to an outing using Wembli! \n\r'+args.message+'\n\rFollow the link to see the details and RSVP.\n\r'+args.rsvpLink;
		var sendArgs = {
			'res':args.res,
			'template': 'email-templates/rsvp',
			'templateArgs': {
				layout: 'email-templates/layout',
				rsvpDate: args.rsvpDate,
				rsvpLink: args.rsvpLink,
				message:args.message,
				req:args.req
			},
			'from': wembliSupport,
			'to': args.email,
			'cc': req.session.customer.email,
			'smtpapiHeader': {
				category: 'rsvp',
				unique_args: {
					friendId: args.friendId,
					planGuid: args.planGuid
				}
			},
			'subject': "Invitation From "+req.session.customer.firstName + ' ' +req.session.customer.lastName,
			'text': alternateText,
		};
		sendEmail(sendArgs, callback);
	},

	'sendSignupEmail': function(args, cb) {
		var callback = (typeof cb === "undefined") ? defaultCb : cb;

		var confirmLink = "http://" + app.settings.host + ".wembli.com/confirm";
		var emailEsc = encodeURIComponent(args.customer.email);
		var tokenEsc = encodeURIComponent(args.customer.confirmation[0].token);
		var next = (typeof args.next !== "undefined") ? encodeURIComponent( args.next ) : encodeURIComponent('/dashboard');
		var nextEsc  = encodeURIComponent(next);
		var confirmLinkEncoded = confirmLink + '/' + emailEsc + '/' + tokenEsc + '?next=' + nextEsc;
		var alternateText = 'Click here to confirm your email address: ' + confirmLink + '/' + emailEsc + '/' + tokenEsc +'?next='+ nextEsc;

		var sendArgs = {
			'res':args.res,
			'template': 'email-templates/signup',
			'templateArgs': {
				layout: 'email-templates/layout',
				confirmLink: confirmLinkEncoded,
				req:args.req
			},
			'from': wembliSupport,
			'to': args.customer.email,
			'smtpapiHeader': {
				category: 'signup'
			},
			'subject': "Welcome to Wembli.com",
			'text': alternateText,
		};
		sendEmail(sendArgs, callback);
	}
};
