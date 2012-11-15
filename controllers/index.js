var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async         = require('async');
var eventRpc      = require('../rpc/event').event;
var dateUtils     = require('date-utils');
var ua            = require('useragent');
//ua(true); //sync with remote server to make sure we have the latest and greatest

module.exports = function(app) {

	app.get('/', function(req, res) {

		//clear the updateEvent session so searches start over
		//this session variable allows you to swap out the event for an existing plan
		delete req.session.updateEvent;

		/*
			args holds the args for the TN GetEvent call
			args.beginDate
			args.orderByClause
			args.nearZip
		*/
		var args = {};
		args.beginDate = getBeginDate();
		args.orderByClause = 'Date'; //order by date
		if (typeof req.session.ipinfo != "undefined") {
			args.nearZip = req.session.ipinfo.postal_code;
		}

		//get nearby events:
		eventRpc['get'].apply(function(err,results) {
			console.log('results from eventrpc: ');
			console.log(results);
			res.render('index', {
				events: results.event,
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		},[args,req,res]);

	});



	app.get('/terms-policies', function(req, res) {
		res.render('terms-policies.jade', {
			title: 'wembli.com - Terms & Policies.'
		});

	});

};

//not sure what the best begin date is for the events list on the home page
//for now we will get events that begin 2 days from today so we have minimal fulfillment issues


function getBeginDate() {
	var daysPadding = 2; //how many days from today for the beginDate
	var d = Date.today();
	d2 = new Date(d);
	d2.setDate(d.getDate() + 2);
	//format the beginDate for the tn query
	return d2.format("shortDate");
}
