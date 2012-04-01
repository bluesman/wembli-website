var querystring = require('querystring');
var fs = require('fs');
var mailer = require("wembli/sendgrid");
var crypto = require('crypto');
var wembliUtils   = require('wembli/utils');
var wembliModel   = require('wembli-model');
var Customer      = wembliModel.load('customer');

module.exports = function(app) {
    app.get('/signup', function(req, res) {
	res.render('signup', {
	    session: req.session,
	    layoutContainer: true,
	    cssIncludes: [],
	    jsIncludes: [],
	    title: 'wembli.com - Signup now.',
	    page:'index',
	    globals:globalViewVars	    
	});
	
    });
    
    app.post(/\/signup\/?/, function(req, res){
	if (!req.param('email')) {
	    return res.redirect( '/' );
	}

	//fetch the customer by email 
	Customer.findOne({email:req.param('email')},function(err,c) {
	    var hash = crypto.createHash('sha512');
	    hash.update(req.param('password'));
	    var digest = hash.digest(encoding='base64');
	    
	    //if no c make one email param
	    if (c == null) {
		//TODO: make sure passwords match

		var newC = {email: req.param('email'),
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
		console.log(customer);
		//make a confirmation token   
		hash = crypto.createHash('md5');
		var confirmationTimestamp = new Date().getTime().toString();
		hash.update(req.param('email')+confirmationTimestamp);
		var confirmationToken = hash.digest(encoding='base64');

		customer.confirmation.push({timestamp: confirmationTimestamp,token: confirmationToken});
		console.log('here');
		customer.eventplan.push(req.session.eventplan);
		customer.save(function(err) {
		    console.log('customer save err: '+err);
		    //iterate through customer.properties 
		    //for each prop: customer.prop = (c.prop ? c.prop : ((typeof result.prop != 'undefined') ? result.prop : null));  
		    req.session.loggedIn = true;
		    req.session.customer = customer;
		
		    //send a confirmation email   
		    var logoCid = new Date().getTime().toString() + 'wembli_logo_300x100_tx.png';
		    var confirmLink = "http://"+app.settings.host+".wembli.com/confirm";
		    var emailEsc = encodeURIComponent(req.session.customer.email);
		    var tokenEsc = encodeURIComponent(req.session.customer.confirmation[0].token);
		    var confirmLinkEncoded = confirmLink + '/' + emailEsc + '/' + tokenEsc;
		    console.log(confirmLinkEncoded);
		   
		    //send the email asynchronously
		    res.render('email-templates/signup', {
			confirmLink:confirmLinkEncoded,
			layout:false,
		    },function(err,htmlStr) {
			var mail = new mailer.EmailMessage({
			    sender: '"Wembli Support" <help@wembli.com>',
			    to:req.session.customer.email
			});
			
			mail.subject = "Welcome to Wembli.com";
			//templatize this 
			mail.body = 'Click here to confirm your email address: http://'+app.settings.host+'.wembli.com/confirm/'+encodeURIComponent(req.session.customer.email)+'/'+encodeURIComponent(confirmationToken);
			mail.html = htmlStr;
			/*
			mail.attachments = [{filename:'wembli_logo_300x100_tx.png',
					     contents:new Buffer(fs.readFileSync('/wembli/website/public/images/wembli_logo_300x100_tx.png')),
					     cid:logoCid}];
					     */
			console.log('sending');		    
			mail.send(function(error, success){
			    console.log("Message "+(success?"sent":"failed:"+error));
			});
		    
		    });

		    //if there is a redirectUrl, show a flash message indicating successful signup
		    var redirectUrl = '/dashboard';
		    if (typeof req.param('redirectUrl') != "undefined") {
			req.flash('info','Signup was successful and your work was saved.');
			redirectUrl = req.param('redirectUrl');
		    }
		    return res.redirect( redirectUrl );		    
		});
		
	    } else {
		//they've already signed up
		req.session.customer = c;
		return res.redirect( '/dashboard' );
	    }

	});

    });

};