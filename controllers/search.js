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
		/*
			args holds the args for the TN GetEvent call
			args.beginDate
			args.orderByClause
			args.nearZip
		*/
		var args = {};
		args.beginDate     = getBeginDate();
		args.orderByClause = 'Date'; //order by date

		if (typeof req.session.visitor.tracking.postalCode != "undefined") {
			args.nearZip = req.session.visitor.tracking.postalCode;
		}

		//get nearby events:
		eventRpc['get'].apply(function(err,results) {
			res.render('search', {
				events: results.event,
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		},[args,req,res]);
	};

	app.get(/^\/partials\/start-plan\/(split-first|split-after|no-split)?/,function(req,res) {
		req.session.plan = new Plan({guid:Plan.makeGuid()});
		console.log('creating new plan in search partial controller');
		req.session.plan.preferences.payment = req.params[0] ? req.params[0] : 'split-first';
		/* must be the organizer if we're creating a new plan - this won't stick if they're not logged in */
		req.session.visitor.context = 'organizer';
		if(req.param('next')) {
			/* tell app to update the location using this header */
			res.redirect('partials'+req.param('next'));
		} else {
			res.render('partials/start-plan',{partial:true});
		}
	});

	app.get(/^\/start-plan\/(split-first|split-after|no-split)?/,function(req,res) {
		/* set payment pref to indicate how this person wants pay */
		req.session.plan = new Plan({guid:Plan.makeGuid()});
		req.session.plan.preferences.payment = req.params[0] ? req.params[0] : 'split-first';
		console.log('creating new plan in search controller as: '+req.session.plan.preferences.payment);
		if(req.param('next')) {
			res.setHeader('x-wembli-location',req.param('next'));
			res.redirect(req.param('next'));
		} else {
			searchView(req,res);
		}
	});

	//app.get('/search/?', searchView);

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
			res.render('search', {
				search: req.param('city'),
				events: results.event,
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		},[args,req,res]);
	});


	app.get(/^\/search(\/events\/(.+)$)?/, function(req, res) {
		console.log('get: '+req.url);
		var title = 'Wembli Search';

		var query = (typeof req.param('search') !== "undefined") ? req.param('search') : req.params[1];
		console.log('search query:'+query);
		if (!query) {
			res.setHeader('x-wembli-location','/search');
			return searchView(req,res);
		}
		query.replace('+',' ');
		req.session.lastSearch = query;

		/* TODO: try to parse out a date from the search string */
		req.session.visitor.lastSearch = {
			searchTerms: query,
			orderByClause: 'Date'
		};

		eventRpc['search'].apply(function(err,results) {
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
