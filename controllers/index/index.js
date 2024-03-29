var ticketNetwork = require('../../lib/wembli/ticketnetwork');
var async = require('async');

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
	//console.log(req.session.ipinfo);
	if (typeof req.session.ipinfo != "undefined") {
	    args.nearZip = req.session.ipinfo.postal_code;
	}
	//clear the updateEvent session so searches start over
	delete req.session.updateEvent;
	//get nearby events:
        //ticketNetwork.SearchEvents({searchTerms:req.session.ipinfo.city,orderByClause:'Date'},
	//ticketNetwork.SearchEvents({searchTerms:'Petco Park',orderByClause:'Date'},
        ticketNetwork.GetEvents(args,
				function(err,results) {
				    var events = [];
				    if (!err && typeof results.Event != "undefined") {
					events = results.Event.slice(0,15);
				    }

				    var renderCb = function() {
					console.log(events);
					res.render('index.jade', {
					    layoutContainer: true,
					    events:events,
					    cssIncludes: [],
					    jsIncludes: [],
					    title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
					    page:'index',
					});
				    };

				    async.forEach(events,function(item,callback) {
					//get the ticket pricing info for this event
					ticketNetwork.GetPricingInfo({eventID:item.ID},function(err,results) {
					    if (err) {
						callback(err);
					    } else {
						console.log(results);
						item.TicketPricingInfo = results;
						callback();
					    }
					});
				    },renderCb);
				    
				});
    });

    app.get('/terms-policies',function(req,res) {
	res.render('terms-policies.jade', {
	    layoutContainer: true,
	    cssIncludes: [],
	    jsIncludes: [],
	    title: 'wembli.com - Terms & Policies.'
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