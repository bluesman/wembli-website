var ticketNetwork = require('wembli/ticketnetwork');
module.exports = function(app) {
    console.log('styleguide loaded...');
    app.get('/style-guide', function(req, res){
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
				       res.render('style-guide', {
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
