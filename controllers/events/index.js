var ticketNetwork = require('wembli/ticketnetwork');

require('date-utils');

module.exports = function(app) {
    console.log('events loaded...');
    app.get('/events', function(req, res){
	res.render('events', {
	    layoutContainer:true,
	    session: req.session,
	    cssIncludes: [],
	    jsIncludes: [],
	    title: 'wembli.com - events.',
	    page:'tickets',
	    globals:globalViewVars
	});
    });

    //search for events
    app.get(/^\/events\/search\/?(.*)$/,function(req,res) {
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
            res.render('events',{
		layoutContainer:true,
		session: req.session,
		q: req.param.q,
		param: req.param,
		cssIncludes: [],
		jsIncludes: [],
		title: 'wembli.com - events.',
		page:'tickets',
                events: results.Event
	    });
        });



	/*
	  eventGroups if I need it
	  
        ticketNetwork.GetEvents(args,function(err,results) {
            console.log(results.Event);
            //var events = psUtils.sort(results.Event,'Date','asc');
            var events = (typeof results.Event == "undefined") ? [] : results.Event;
            var eventGroups = [];
            var normalizeEvents = function(item,callback) {
                if (typeof eventGroups[item.Name] == "undefined") {
                    //if there isn't one yet, initialize it with a min date
                    eventGroups[item.Name] = psUtils.deepCopy(item);
                    eventGroups[item.Name].beginDate = item.Date;
                    delete eventGroups[item.Name].DisplayDate;
                    delete eventGroups[item.Name].ID;
                    delete eventGroups[item.Name].Clicks;
                    eventGroups[item.Name].events = [];
                    eventGroups[item.Name].events.push(item);
                } else {
                    //just set the max date and push the item into the events array
                    eventGroups[item.Name].events.push(item);
                    eventGroups[item.Name].endDate = item.Date;
                }
                callback(null,item);
	    };
            async.forEachSeries(events,normalizeEvents,function(err,results) {
                req.session.eventGroups = psUtils.deepCopy(eventGroups);
                //console.log(req.session.eventGroups);
                render(null,{req:req,
                             res:res,
                             path:baseUrl,
                             eventGroups:eventGroups});
            });
        });    

	*/





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