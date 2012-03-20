var fs            = require('fs');
var mailer        = require("wembli/sendgrid");
var crypto        = require('crypto');
var wembliUtils   = require('wembli/utils');
var wembliModel   = require('wembli-model');
var Customer      = wembliModel.load('customer');
var querystring   = require('querystring');

module.exports = function(app) {
    console.log('beta-signup loaded...');

    app.get(/\/confirm\/(.*?)\/(.*)\/?/, function(req, res){    
	console.log(req.params[0]);
	console.log(req.params[1]);

        Customer.findOne({email:req.params[0]},function(err,c) {
	    if (c == null) {
		//this is not a valid confirmation url
		return res.render('index', {
		    errors:{invalidToken:true},
		    session:req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - something went wrong.'
		});
	    } else {
	
		var dbToken = c.confirmation[0].token;
		if (dbToken == req.params[1]) {
		    //set customer to confirmed so they can access the dashboard
		    c.confirmed = true;
		    c.save();
		    req.session.signedUp = true;
		    req.session.customer = c;
		    return res.render('index', {
			session:req.session,
			cssIncludes: [],
			jsIncludes: [],
			title: 'wembli.com - your personal event concierge.'
		    });
		    
		} else {
		    return res.render('index', {
			errors:{invalidToken:true},
			session:req.session,
			cssIncludes: [],
			jsIncludes: [],
			title: 'wembli.com - something went wrong.'
		    });
		}
	    } 
	});
    });


    app.post('/beta-signup', function(req, res){
	console.log('submitted');

	if (!req.param('email')) {
	    return res.redirect( '/' );
	}

	if ((typeof req.session.signedUp == "undefined") && req.param('email')) {
	    //write to the database
	    console.log(req.param('email'));
	    //fetch the customer by email 
	    Customer.findOne({email:req.param('email')},function(err,c) {
		//if no c make one email param
		if (c == null) {
		    var newC = {email: req.param('email'),
				confirmed: false
			       };
		    
		    //if there's ipinfo in the session grab the zip   
		    if (/\d+/.test(req.session.ipinfo.zipCode)) {
			newC.zip_code = req.session.ipinfo.zipCode;
		    }

		    //make a confirmation token   
		    hash = crypto.createHash('md5');
		    var confirmationTimestamp = new Date().getTime().toString();
		    hash.update(req.param('email')+confirmationTimestamp);
		    var confirmationToken = hash.digest(encoding='base64');
		    newC.confirmation = [{timestamp: confirmationTimestamp,token: confirmationToken}];

		    var customer = new Customer(newC);
		    customer.save();
		    //iterate through customer.properties 
		    //for each prop: customer.prop = (c.prop ? c.prop : ((typeof result.prop != 'undefined') ? result.prop : null));  
		    req.session.customer = customer;

		    //send a confirmation email   
		    var logoCid = new Date().getTime().toString() + 'wembli_logo_300x100_tx.png';
		    var confirmLink = "http://www.wembli.com/confirm";
		    var emailEsc = encodeURIComponent(req.session.customer.email);
		    var tokenEsc = encodeURIComponent(req.session.customer.confirmation[0].token);
		    var confirmLinkEncoded = confirmLink + '/' + emailEsc + '/' + tokenEsc;
		    console.log(confirmLinkEncoded);

		    res.render('signup-email', {
			confirmLink:confirmLinkEncoded,
			layout:false,
			token:confirmationToken,
			logoCid: logoCid,
			session: req.session
		    },function(err,htmlStr) {
			console.log(htmlStr);
			var mail = new mailer.EmailMessage({
			    sender: '"Wembli Support" <help@wembli.com>',
			    to:req.session.customer.email
			});

			mail.subject = "Welcome to Wembli.com";
			//templatize this 
			mail.body = 'Click here to confirm your email address: http://www.wembli.com/confirm/'+encodeURIComponent(req.session.customer.email)+'/'+encodeURIComponent(confirmationToken);
			mail.html = htmlStr;
			console.log(htmlStr);
			mail.attachments = [{filename:'wembli_logo_300x100_tx.png',
					     contents:new Buffer(fs.readFileSync('/wembli/website/public/images/wembli_logo_300x100_tx.png')),
					     cid:logoCid}];

			mail.send(function(error, success){
			    console.log("Message "+(success?"sent":"failed:"+error));
			});

		    });

		} else {
		    //they've already signed up
		    req.session.customer = c;
		}
		req.session.signedUp = true;
		res.render('index', {
		    session: req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    title: 'wembli.com - coming soon.'
		});
	    });
	} else {
	    res.render('index', {
		session: req.session,
		cssIncludes: [],
		jsIncludes: [],
		title: 'wembli.com - coming soon.'
	    });
	}	    
    });
};