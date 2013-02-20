var ticketNetwork = require('../lib/wembli/ticketnetwork');
var async         = require('async');
var eventRpc      = require('../rpc/event').event;
var dateUtils     = require('date-utils');
var ua            = require('useragent');
//ua(true); //sync with remote server to make sure we have the latest and greatest
var querystring = require('querystring');
var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');

module.exports = function(app) {

	var searchView = function(req, res) {

		//clear the updateEvent session so searches start over
		//this session variable allows you to swap out the event for an existing plan
		//delete req.session.updateEvent;

		/*
			args holds the args for the TN GetEvent call
			args.beginDate
			args.orderByClause
			args.nearZip
		*/
		var args = {};
		args.beginDate     = getBeginDate();
		args.orderByClause = 'Date'; //order by date

		if (typeof req.session.ipinfo != "undefined") {
			args.nearZip = req.session.ipinfo.postal_code;
		}

		//get nearby events:
		eventRpc['get'].apply(function(err,results) {
			res.render('search', {
				events: results.event,
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		},[args,req,res]);
	};

	app.get('/partials/start-plan',function(req,res) {
		req.session.plan = new Plan({guid:Plan.makeGuid()});
		req.session.plan.preferences.payment = 'group';
		res.render('partials/start-plan',{partial:true});
	});

	app.get('/start-plan',function(req,res) {
		//set session pref to indicate that this person wants to have friends pay up front
		req.session.plan = new Plan({guid:Plan.makeGuid()});
		req.session.plan.preferences.payment = 'group';
		searchView(req,res);
	});

	app.get('/partials/buy-now',function(req,res) {
		req.session.plan = new Plan({guid:Plan.makeGuid()});
		req.session.plan.preferences.payment = 'self';
		res.render('partials/buy-now',{partial:true});
	});

	app.get('/buy-now',function(req,res) {
		req.session.plan = new Plan({guid:Plan.makeGuid()});
		req.session.plan.preferences.payment = 'self';
		searchView(req,res);
	});

	app.get('/search/?', searchView);

	//these come from the more events button
	app.get('/search/events/:city/:from', function(req,res) {

		var whereClause = '';
		if (req.param('from')) {
			whereClause = 'Date > DateTime("' + req.param('from') + '")';
		}

		var args = {
				searchTerms: req.param('city'),
				whereClause: whereClause,
				orderByClause: 'Date'
		};

		eventRpc['search'].apply(function(err,results) {
			console.log('results from eventrpc: ');
			console.log(results);

			res.render('search', {
				search: req.param('city'),
				events: results.event,
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		},[args,req,res]);
	});


	app.get('/search/events/:query?', function(req, res) {
		console.log(req.param('search'));

		var title = 'Wembli Search';

		var query = req.param('query') ? querystring.unescape(req.param('query')).replace(/\+/g,' ') : querystring.unescape(req.param('search')).replace(/\+/g,' ');
		console.log('query: '+query);
		if (!query) {
			return res.redirect('/search');
		}

		query.replace('+',' ');
		req.session.lastSearch = query;

		/* TODO: try to parse out a date from the search string */
		if (typeof req.session.visitor.lastsearch === "undefined") {
			req.session.visitor.lastSearch = {
				searchTerms: query,
				orderByClause: 'Date'
			};
		}

		eventRpc['search'].apply(function(err,results) {
			console.log('results from eventrpc: ');
			console.log(results);

			res.render('search', {
				search: query,
				events: results.event,
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		},[req.session.visitor.lastSearch,req,res]);
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
