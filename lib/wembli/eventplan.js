var wembliModel = require('wembli-model'),
    Customer = wembliModel.load('customer');

module.exports = function(req, res, next) {
    //new eventplan if there isn't one already
    if (typeof req.session.currentPlan == "undefined") {
        req.session.currentPlan = {};
    }

    //default to them not being an organizer
    if (typeof req.session.isOrganizer == "undefined") {
        req.session.isOrganizer = false;
    }
    //make a model from the customer obj
    if (typeof req.session.customer != "undefined") {
        Customer.findOne({
            email: req.session.customer.email
        }, function(err, c) {
            if (c != null) {
                req.session.customer = c;
                next();

            }
        });
    } else {
        next();
    }
};
