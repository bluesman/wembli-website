var ticketNetwork = require('../lib/wembli/ticketnetwork');

exports.event = {
    get: function(args,req,res) {
	console.log(args);
	var me = this;
	//ticketNetwork.GetEvents({beginDate:date,nearZip:zip,orderByClause:'Date'},function(err,results) {
	ticketNetwork.GetEvents(args,function(err,results) {
	    if (err) {
		return me(err);
	    }
	    
	    console.log(results);
	    me(null,{success:1,
		     event:results.Event});

	});
    }

};