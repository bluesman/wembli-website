var ticketNetwork = require('wembli/ticketnetwork');

require('date-utils');


module.exports = function(app) {
    console.log('tickets loaded...');
    app.get('/tickets', function(req, res){
	res.render('tickets', {
	    session: req.session,
	    cssIncludes: [],
	    jsIncludes: [],
	    title: 'wembli.com - tickets.',
	    page:'tickets',
	    globals:globalViewVars
	});
    });

    //search for tickets
    app.get(/^\/tickets\/search\/?(.*)$/,function(req,res) {
	//everything after search should go in order: /query/from/to/adults/children;
	splitSearchUri(req);
	
	var whereClause = '';
	if (req.param.from) {
	    whereClause = 'Date > DateTime("'+req.param.from+'")';
	}

	if (req.param.to) {
	    whereClause += ' AND Date < DateTime("'+req.param.to+'")';
	}
        ticketNetwork.SearchEvents({searchTerms:req.param.q,whereClause:whereClause,orderByClause:'Date'},function(err,results) {
            res.render('tickets',{
		session: req.session,
		param: req.param,
		cssIncludes: [],
		jsIncludes: [],
		title: 'wembli.com - tickets.',
		page:'tickets',
		globals:globalViewVars,
                events:results.Event
	    });
        });
    });

    app.get(/^\/tickets\/event\/(\d+)\/(.*)$/,function(req,res) {
	var eventId = req.params[0];
	ticketNetwork.GetTickets({eventID: eventId},function(err,tickets) {
            console.log(err);
            console.log(tickets);
	    res.render('event', {
                session:req.session,
                tickets:tickets.TicketGroup,
		title: 'wembli.com - tickets.',
		page:'tickets',
		globals:globalViewVars,
		cssIncludes: [],
                jsIncludes: ['http://maps.google.com/maps/api/js?v=3.3&sensor=false','/js/jquery.fanvenues.js','/js/venue.js']
            });
        });
    });
};

function splitSearchUri(req) {
    if (/\//.test(req.params[0])) {
	req.params = req.params[0].split('/');
    }

    /*
      if no search query is supplied then use ipinfo zipcode
      if we cannot determine ipinfo zipcode then display an error
      if we have a search query, do not limit it to the determined zip code
    */
    req.param.q        = req.params[0];
    req.param.from     = req.params[1];
    req.param.to       = req.params[2];
    req.param.adults   = req.params[3];
    req.param.children = req.params[4];

    console.log(req.params.q);

    //set some defaults if some params are not supplied
    //if no search query, use zip code
    if (!req.param.q) {
	if (/\d+/.test(req.session.ipinfo.zipCode)) {
            req.param.q = req.session.ipinfo.zipCode;
	}
    }


    //if no from use today
    if (!req.param.from) {
	console.log('no from date use today');
	var d = Date.today();
	req.param.from = d.format("shortDate");
    }

    //if there is a from and no to then use from + 6 wk for to
    if (!req.param.to) {
	console.log('adding 6 wk to: '+req.param.from);
	var d = new Date(req.param.from);
	req.param.to   = d.addWeeks(18).format("shortDate");
    }

    //if no adults, use 1
    if (!req.param.adults) {
	req.param.adults = 1;
    }

    //if no children, use 0
    if (!req.param.children) {
	req.param.children = 0;
    }

    //donzies, log the params for fun
    console.log(req.param.q);
    console.log(req.param.from);
    console.log(req.param.to);
    console.log(req.param.adults);
    console.log(req.param.children);
}