var ticketNetwork = require('../../lib/wembli/ticketnetwork');

module.exports = function(app) {
    console.log('index loaded...');
    app.get('/', function(req, res){
	if (req.session.loggedIn) {
	    return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard') );		    
	}
	
        var d = Date.today();
	d2 = new Date ( d );
	d2.setDate ( d.getDate() + 2 );
        var beginDate = d2.format("shortDate");
	var args = {beginDate:beginDate};
	args.orderByClause = 'Date';
	console.log(req.session.ipinfo);
	if (typeof req.session.ipinfo != "undefined") {
	    args.nearZip = req.session.ipinfo.postal_code;
	}

	//get nearby events:
        //ticketNetwork.SearchEvents({searchTerms:req.session.ipinfo.city,orderByClause:'Date'},
	//ticketNetwork.SearchEvents({searchTerms:'Petco Park',orderByClause:'Date'},
        ticketNetwork.GetEvents(args,
				function(err,results) {
				    var events = [];
				    if (!err && typeof results.Event != "undefined") {
					events = results.Event.slice(0,15);
				    }
				    res.render('index.jade', {
					layoutContainer: true,
					events:events,
					cssIncludes: [],
					jsIncludes: [],
					title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
					page:'index',
				    });
				    
				});
    });


    app.get('/testfb',function(req,res) {
	res.render('fbtest.jade', {
	    layout:false,
	});
    });

    app.get('/fbchannel', function(req,res) {
	res.header('Pragma','public');
	res.header('Cache-Control','max-age='+2592000);
	res.header('Expires',new Date().getTime().toString());
	res.render('fbchannel.jade', {
	    layout:false,
	});
    });

};