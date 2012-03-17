var ticketNetwork = require('wembli/ticketnetwork');

module.exports = function(app) {
    console.log('index loaded...');
    app.get('/', function(req, res){
	if (req.session.loggedIn) {
	    return res.redirect( ( req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard') );		    
	}
	
        var d = Date.today();
        var beginDate = d.format("shortDate");

	//get nearby events:
        ticketNetwork.SearchEvents({searchTerms:req.session.ipinfo.city,orderByClause:'Date'},
	//ticketNetwork.SearchEvents({searchTerms:'Petco Park',orderByClause:'Date'},
				function(err,results) {
				    var events = results.Event.slice(0,5);
				    if (!events) {
					events = [];
				    }
				    res.render('index.jade', {
					session: req.session,
					layoutContainer: true,
					events:events,
					cssIncludes: [],
					jsIncludes: [],
					title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
					page:'index',
					globals:globalViewVars
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