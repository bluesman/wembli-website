var fs            = require('fs');
var mailer        = require("wembli/sendgrid");
var crypto        = require('crypto');
var wembliUtils   = require('wembli/utils');
var wembliModel   = require('wembli-model');
var Customer      = wembliModel.load('customer');
var querystring   = require('querystring');

//var https = require('https');

module.exports = function(app) {
    console.log('dashboard loaded...');

    app.get(/\/confirm\/(.*?)\/(.*)\/?/, function(req, res){    
	console.log(req.params[0]);
	console.log(req.params[1]);

        //validate the token      
        //a) must not be expired (1 week)               
        //b) must be a token that belong to this customer                                                            
        //if they're not logged in, make them provide a password before confirming                                   
                                  
        if (req.session.loggedIn) {                     
            var expired = true;   
            console.log('logged in, great!');           
            var dbTimestamp = req.session.customer.confirmation[0].timestamp;                                        
            var currentTimestamp = new Date().getTime();
            var timePassed = (currentTimestamp - dbTimestamp)/1000;                                                  
            console.log(timePassed);                    
                                  
            //has it been more than 1 week?             
            if (timePassed < 604800) {                  
                expired = false;  
            }                     
            if (expired) {        
                return res.render('dashboard/confirm', {
                    errors:{expiredToken:true},         
                    session:req.session,                
                    cssIncludes: [],                    
                    jsIncludes: [],
		    globals:globalViewVars,
                    title: 'wembli.com - check your email!.'                                                       
                });               
                                  
            }                     
                                  
            //not expired woot!   
            var dbToken = req.session.customer.confirmation[0].token;                                                
            if (dbToken == req.params[1]) {             
                //set customer to confirmed so they can access the dashboard                                         
                req.session.customer.confirmed = true;  
                req.session.customer.save();            
                return res.redirect( '/dashboard' );    
            } else {              
                //some sort of hackery is going down - gtfo                                                          
                return res.render('dashboard/confirm', {
                    errors:{invalidToken:true},         
                    session:req.session,                
                    cssIncludes: [],                    
                    jsIncludes: [],
		    globals:globalViewVars,
                    title: 'wembli.com - check your email!.'                                                       
                });               
                                  
            }  
        } else {                                        
            //render password page                      
            return res.render('dashboard/confirm-need-password', {                                                   
                email: req.params[0],                   
                token: req.params[1],                   
                session:req.session,                    
                cssIncludes: [],                        
                jsIncludes: [],
		globals:globalViewVars,
                title: 'wembli.com - supply your password!.'                                                       
            });                                         

        } 

    });

    app.get('/dashboard/?', function(req, res){
	if (req.session.loggedIn) {
	    console.log(req.session.customer.email);
	    if (req.session.customer.confirmed == false) {
		//need email confirmation
		return res.render('dashboard/confirm', {
		    session:req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    globals:globalViewVars,
		    title: 'wembli.com - check your email!.'
		});
	    }


	    res.render('dashboard/index', {
		session:req.session,
		cssIncludes: [],
		jsIncludes: ['/js/dashboard.js'],
		globals:globalViewVars,
		title: 'wembli.com - login to get the best seats.'
	    });
	    
	} else {
	    console.log('no auth');
	    res.redirect('/login',302);
	}
    });

    //might be able to post straight to the login/index.js submit rather than use this - it supports using a redirect url on success
    app.post(/\/confirm?/, function(req,res) {
	//validate password and log them in then redirect to GET confirm
	var hash = crypto.createHash('sha512');
	hash.update(req.param('password'));
	var digest = hash.digest(encoding='base64');
	//validate email/password against the db
	Customer.findOne({email:req.param('email')},function(err,c) { 
	    if ((err == null) && (c != null)) {
		//set up the session and head to the redirect url
		if (typeof c.password != "undefined" && c.password == digest) {
		    req.session.loggedIn = true;
		    req.session.customer = c;
		    return res.redirect( '/confirm/'+encodeURIComponent(req.param('email'))+'/'+encodeURIComponent(req.param('token')) );
		} else {
		    //password is wrong - try again
		    //count how many consecutive bad password attempts and lock them out after 3
		    //count in the db rather than the session

		    //render password page
		    return res.render('dashboard/confirm-need-password', {
			errors:{general:true},
			email: req.param('email'),
			token: req.param('token'),
			session:req.session,
			cssIncludes: [],
			jsIncludes: [],
			globals:globalViewVars,
			title: 'wembli.com - supply your password!.'
		    });
	    

		}
	    } else {
		//no customer for that email?? wtf goto logout
		return res.redirect( '/logout' );		    
	    }

	});
    });

    app.get(/\/confirm\/(.*)\/(.*)\/?/, function(req, res){    
	console.log(req.params[0]);
	console.log(req.params[1]);
	//validate the token
	//a) must not be expired (1 week)
	//b) must be a token that belong to this customer
	//if they're not logged in, make them provide a password before confirming
	
	if (req.session.loggedIn) {
	    var expired = true;
	    console.log('logged in, great!');
	    var dbTimestamp = req.session.customer.confirmation[0].timestamp;
	    var currentTimestamp = new Date().getTime();
	    var timePassed = (currentTimestamp - dbTimestamp)/1000;
	    console.log(timePassed);

	    //has it been more than 1 week?
	    if (timePassed < 604800) {
		expired = false;
	    }
	    if (expired) {
		return res.render('dashboard/confirm', {
		    errors:{expiredToken:true},
		    session:req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    globals:globalViewVars,
		    title: 'wembli.com - check your email!.'
		});
		
	    }
	
	    //not expired woot!
	    var dbToken = req.session.customer.confirmation[0].token;
	    if (dbToken == req.params[1]) {
		//set customer to confirmed so they can access the dashboard
		req.session.customer.confirmed = true;
		req.session.customer.save();
		return res.redirect( '/dashboard' );
	    } else {
		//some sort of hackery is going down - gtfo
		return res.render('dashboard/confirm', {
		    errors:{invalidToken:true},
		    session:req.session,
		    cssIncludes: [],
		    jsIncludes: [],
		    globals:globalViewVars,
		    title: 'wembli.com - check your email!.'
		});

	    }

	} else {
	    //render password page
	    return res.render('dashboard/confirm-need-password', {
		email: req.params[0],
		token: req.params[1],
		session:req.session,
		cssIncludes: [],
		jsIncludes: [],
		    globals:globalViewVars,
		title: 'wembli.com - supply your password!.'
	    });
	    
	}

    });

    app.get(/\/dashboard\/resend-confirmation-email?/, function(req, res){
	//TODO: make sure they are logged in!


	//get the customer
	if (req.session.customer.confirmed == false) {
	    //determine if the existing confirmation token should be used or overwritten
	    var expired = true;
	    if (typeof req.session.customer.confirmation != "undefined") {
		var existingTimestamp = parseInt(req.session.customer.confirmation[0].timestamp);
		
		//get current timestamp
		var currentTimestamp = new Date().getTime();
		var timePassed = (currentTimestamp - existingTimestamp)/1000;
		console.log(timePassed);
		if (timePassed < 1800) {
		    expired = false;
		}
	    }

	    //if the timestamp is > 30 mins, expire it by overwriting the customer confirmation obj with new token data
	    if (expired) {
		console.log('token expired making a new one');
		//make a new token
		hash = crypto.createHash('md5');
		var confirmationTimestamp = new Date().getTime().toString();
		var tmp = req.session.customer.email+confirmationTimestamp;
		hash.update(tmp);
		var confirmationToken = hash.digest(encoding='base64');
		console.log(req.session.customer.confirmation);

		//save the token to the customer obj
		req.session.customer.confirmation = [{timestamp:confirmationTimestamp,token:confirmationToken}];
		console.log(req.session.customer.confirmation);
		req.session.customer.save();
	    } else {
		console.log('token was not expired, using existing');
	    }

	    //send the email
	    console.log('sending email...');
	    //send a confirmation email
	    /* TODO:
               - make the readfile async
               - make the html rendering use a layout
               - make the body text rendered from a template or maybe read from a file
            */




	    
	    //send a confirmation email   
	    var logoCid = new Date().getTime().toString() + 'wembli_logo_300x100_tx.png';
	    var confirmLink = "http://"+app.settings.host+".wembli.com/confirm";
	    var emailEsc = encodeURIComponent(req.session.customer.email);
	    var tokenEsc = encodeURIComponent(req.session.customer.confirmation[0].token);
	    var confirmLinkEncoded = confirmLink + '/' + emailEsc + '/' + tokenEsc;
	    console.log(confirmLinkEncoded);
	    
	    res.render('email-templates/signup-email', {
		confirmLink:confirmLinkEncoded,
		layout:false,
		token: req.session.customer.confirmation[0].token,
		logoCid: logoCid,
		session: req.session
	    },function(err,htmlStr) {
		console.log(htmlStr);
		var mail = new mailer.EmailMessage({
		    sender: '"Wembli Support" <help@wembli.com>',
		    to:req.session.customer.email
		});
		
		mail.subject = "Welcome to Wembli.com";
		console.log(req.session.customer.email);
		console.log(req.session.customer.confirmation[0].token);
		//templatize this 
		mail.body = 'Click here to confirm your email address: http://'+app.settings.host+'.wembli.com/confirm/'+encodeURIComponent(req.session.customer.email)+'/'+encodeURIComponent(req.session.customer.confirmation[0].token);
		mail.html = htmlStr;
		console.log(htmlStr);
		mail.attachments = [{filename:'wembli_logo_300x100_tx.png',
				     contents:new Buffer(fs.readFileSync('/wembli/website/public/images/wembli_logo_300x100_tx.png')),
				     cid:logoCid}];
		
		mail.send(function(error, success){
		    console.log("Message "+(success?"sent":"failed:"+error));
		});

	    });
	    


	    //render the dashboard/confirm page	    
	    return res.render('dashboard/confirm', {
		session:req.session,
		cssIncludes: [],
		jsIncludes: [],
		globals:globalViewVars,
		title: 'wembli.com - check your email!.'
	    });

	} else {
	    //already confirmed? then send to dashboard
	    return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard') );		    
	}	


    });
};

