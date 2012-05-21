var wembliModel      = require('wembli-model'),
    Customer         = wembliModel.load('customer');
var crypto = require('crypto');
var mailer = require("../../lib/wembli/sendgrid");

var conf = {
	fb: {
            appId: '314732478586428',
	    appSecret: '68b80c2adfd5421b6c9df85751264d4e'
	}
}


module.exports = {
    conf: conf,

    init: function(ea) {
	//ea.debug = true;
	ea.everymodule.findUserById( function (req, id, callback) {
	    console.log('findbyuserid');
	    Customer.findById(id,function(err,c) {
		if (err) {
		    callback(err);
		} else {
		    console.log('found customer');
		    req.session.customer = c;
		    callback(null,c);
		}
	    });
	});

	ea.everymodule.handleLogout(function(req,res) {
	    req.session.loggedIn = false;
	    req.session.currentPlan = {};
	    delete req.session.customer;
	    req.logout();
	    return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/') );
	});

	ea.facebook
	    .appId(conf.fb.appId)
	    .appSecret(conf.fb.appSecret)
	    .handleAuthCallbackError( function (req, res) {
		// If a user denies your app, Facebook will redirect the user to
		// /auth/facebook/callback?error_reason=user_denied&error=access_denied&error_description=The+user+denied+your+request.
		// This configurable route handler defines how you want to respond to
		// that.
		// If you do not configure this, everyauth renders a default fallback
		// view notifying the user that their authentication failed and why.
		req.flash('error','Unable to login via facebook, please login manually.');
		res.redirect('/');
	    })
	    .findOrCreateUser( function (session, accessToken, accessTokenExtra, user, data) {
		var res = data.res;
		var promise = this.Promise();

		if (typeof user == "undefined") {
		    promise.fail('no user found');
		}
		session.loginRedirect = true;
		session.fbAccessToken = accessToken;
		//check for an existing customer
		Customer.findOne({email:user.email},function(err,c) {
		    if (c != null)  {
			//already have a customer for this email - log in
			session.customer = c;
			session.loggedIn = true
			console.log('logged in!');
			return promise.fulfill(c);
		    }
		    console.log('new customer from facebook');
		    var newC = {email: user.email,
				fbId: user.id,
				first_name: user.first_name,
				last_name: user.last_name,
				confirmed: true
			       };
		
		    //if there's ipinfo in the session grab the zip   
		    if (typeof session.ipinfo != "undefined") {
			if (/\d+/.test(session.ipinfo.zipCode)) {
			    newC.zip_code = session.ipinfo.zipCode;
			}
		    }
		    var customer = new Customer(newC);
		    //make a confirmation token   
		    hash = crypto.createHash('md5');
		    var confirmationTimestamp = new Date().getTime().toString();
		    hash.update(customer.email+confirmationTimestamp);
		    var confirmationToken = hash.digest(encoding='base64');
		    confirmationToken.replace('/','');

		    customer.confirmation.push({timestamp: confirmationTimestamp,token: confirmationToken});

		    customer.eventplan.push(session.currentPlan);

		    customer.save(function(err) {
			session.loggedIn = true;
			session.customer = customer;
		
			//send a welcome email   
			//send the email asynchronously
			res.render('email-templates/welcome', {
			    layout:'email-templates/layout',
			},function(err,htmlStr) {
			    var mail = {
				from: '"Wembli Support" <help@wembli.com>',
				to:session.customer.email,
				headers: {
				    'X-SMTPAPI': {
					category : "welcome",
				    }
				},
				
			    };
			    mail.subject = "Welcome to Wembli.com";
			    //templatize this 
			    mail.html = htmlStr;
			    mailer.sendMail(mail,function(error, success){
				console.log("Message "+(success?"sent":"failed:"+error));
			    });
			    
			});

			//if there is a redirectUrl, show a flash message indicating successful signup
			/*
			if (typeof session.loggedInRedirectUrl ) {
			    req.flash('info','Signup was successful and your work was saved.');
			    redirectUrl = req.param('redirectUrl');
			}
			console.log('redirecting to: '+redirectUrl);
			return res.redirect( redirectUrl );		    
			*/
			return promise.fulfill(session.customer);
		    });
		});
		return promise;
		//return usersByFbId[fbUserMetadata.email] || (usersByFbId[fbUserMetadata.email] = addUser('facebook', fbUserMetadata));
	    })
	    .scope('email,user_events,friends_events,user_location,friends_location,read_friendlists,create_event,manage_friendlists,publish_checkins,publish_stream,rsvp_event')
	    .redirectPath('/login/facebook');
    }
};

