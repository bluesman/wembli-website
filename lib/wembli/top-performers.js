var tn = require('wembli/ticketnetwork');

(function() {
    module.exports = function(req,res,next) {
	if (typeof req.session.topPerformers == "undefined") {
	    tn.GetHighSalesPerformers({numReturned:10},function(err,results) {
		req.session.topPerformers = results.PerformerPercent;
		next();
	    });
	} else {
	    next();
	}
    }

}());