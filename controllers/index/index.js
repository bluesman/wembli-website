var ticketNetwork = require('wembli/ticketnetwork');

module.exports = function(app) {
    console.log('index loaded...');
    app.get('/', function(req, res){
	if (typeof req.session.customer == "undefined" || (req.session.customer.confirmed == false)) {
	    delete req.session.signedUp;
	}
	
        var d = Date.today();
        var beginDate = d.format("shortDate");

	console.log(req.session.ipinfo);

	//get nearby events:
        //ticketNetwork.SearchEvents({searchTerms:req.session.ipinfo.cityName,orderByClause:'Date'},
	ticketNetwork.SearchEvents({searchTerms:'Petco Park',orderByClause:'Date'},
				function(err,results) {
				   var events = results.Event;
				   if (!events) {
				       events = [];
				   }
				    res.render('index.jade', {
					session: req.session,
					events:events,
					cssIncludes: [],
					jsIncludes: [],
					title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
					page:'index',
					globals:globalViewVars
				    });
				    
				});
    });
};