var wembliModel   = require('wembli-model');
var Customer      = wembliModel.load('customer');
var payPal        = require('../../lib/wembli/paypal');

module.exports = function(app) {
    //callback from paypal when payment is received by receiver
    app.all("/callback/paypal/:action/:guid/:token",function(req,res) {
	console.log(req.url+' called');
	console.log(req.params);

	///get the plan for this guid and mark payment completed for this token

	Customer.findPlanByGuid(req.param('guid'),function(err,c) {
	    if (err) {

	    }
	    for (var i in c.eventplan) {
		if (typeof c.eventplan[i] == "undefined") {
		    continue;
		}
		if (typeof c.eventplan[i].config == "undefined") {
		    continue;
		}

		if (c.eventplan[i].config.guid == req.param('guid')) {
		    //update the friend for this event
		    for (idx in c.eventplan[i].friends) {
			var friend = c.eventplan[i].friends[idx];
			if (friend.token.token == req.param('token')) {
			    //got a winner finally!


			    //get payment details for this paykey
			    /*
			    var payKey = friend.payment.payKey; //may not need this

			    var params = {payKey:payKey};
			    payPal.Pay(params,function(err,results) {
				if (err) {
				}
				
				console.log('paymentDetails');
				console.log(results);
			    });
			    */

			    //add a timestamp and completed = true to the friend in the plan
			    c.eventplan[i].friends[idx].payment[req.param('action')] = 1;	
			    var dateKey = req.param('action')+'LastDate';
			    c.eventplan[i].friends[idx].payment[dateKey] = new Date().format("m/d/yy h:MM TT Z");
			    c.markModified('eventplan');
			    c.save();
			    break;
			}
		    }
		}
	    }
	});
	if (req.param('action') == 'return') {
	    req.flash('plan-msg','Welcome back! Thanks for using wembli to plan your outing.');
	    res.redirect('/plan/view')
	} else {
	    res.send(200);
	}
    });
};