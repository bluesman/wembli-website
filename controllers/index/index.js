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
        ticketNetwork.SearchEvents({searchTerms:req.session.ipinfo.cityName,orderByClause:'Date'},
				function(err,results) {
				    res.render('index.jade', {
					session: req.session,
					events:results.Event,
					cssIncludes: [],
					jsIncludes: [],
					title: 'wembli.com - home stuff.',
					page:'index',
					globals:globalViewVars
				    });
				    
				});
    });
};