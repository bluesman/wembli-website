var wembliModel = require('wembli-model'),
    Customer = wembliModel.load('customer');

module.exports = function(req, res, next) {
  if (typeof req.session.customer === "undefined") {
    return next();
  }

  //make a model from the customer obj
  Customer.findOne({email: req.session.customer.email}, function(err, c) {
    if (!c) {
      /* this is bad we had a cust and now its gone */
      return next('could not find customer for email: '+req.session.customer.email+ ' ERR: '+err);
    }

    req.session.customer = c;
    console.log('customer:');
    console.log(req.session.customer);
    return next();
  });
}
