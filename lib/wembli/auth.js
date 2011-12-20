var querystring = require('querystring');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');

/* 
make sure the session variable reflects the login state
we can log in through the standard login form or through facebook.
If the user logs in through facebook we need to know if they are logged in
so when they first load a page they are remembered and not asked to log in.
this function sets up the phatseat session if they are logged into facebook
*/
module.exports = function(req,res,next) {
    console.log('auth loaded');
    //first check the session
    next();
}

/*
*/

