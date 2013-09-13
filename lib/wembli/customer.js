var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');

var Facebook = require('facebook-client').FacebookClient;
var facebook_client = new Facebook(app.settings.fbAppId, app.settings.fbAppSecret, {
  timeout: 10000
});

module.exports = function(req, res, next) {
  if(!req.session.customer) { /* if there's a req.session.facebook.accessToken, try to log in with facebook */
    if((typeof req.session.facebook !== "undefined") && (req.session.facebook.accessToken !== "undefined")) {
      console.log('login with facebook');
      facebook_client.getSessionByAccessToken(req.session.facebook.accessToken)(function(facebookSession) { /* nope can't login with this token - they're gonna have to relog in with fb */
        if(!facebookSession) {
          return next();
        }
        /* check if this session is valid */
        facebookSession.isValid()(function(isValid) { /* not valid they will have to log in again */
          if(!isValid) {
            return next();
          }

          /* get the user info so i can look for this customer in the db */
          facebookSession.getMeta()(function(user) { /* find a customer in the db that has this fb id - it should exist */
            console.log('facebook user:');
            console.log(user);

            Customer.findOne({"socialProfiles.facebook.id": user.id}, function(err, c) {
              if(c != null) { /* already have a customer for this email or profile? Save the profile then log them in */
                req.session.customer = c;
                req.session.loggedIn = true;
                //console.log('customer:');
                //console.log(req.session.customer);
                return next();
              } else {
                console.log('no customer in the db for this facebook account - this really should never happen');
                return next();
              }
            });
          });
        });
      });
    } else {
      /* there's no customer or facebook in session */
      return next();
    }
  } else {
    /* make a model from the customer obj */
    Customer.findOne({email: req.session.customer.email}, function(err, c) {
      if(!c) { /* this is bad we had a cust and now its gone */
        return next('could not find customer for email: ' + req.session.customer.email + ' ERR: ' + err);
      }

      req.session.customer = c;
      console.log('customer');
      //console.log(req.session.customer);
      return next();
    });
  }
}
