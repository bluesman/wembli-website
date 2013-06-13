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

	app.get(/^\/(index)?$/, function(req, res) {
		var args = {};
		args.beginDate     = getBeginDate();
		args.orderByClause = 'Date'; //order by date

		if (typeof req.session.visitor.tracking.postalCode != "undefined") {
			args.nearZip = req.session.visitor.tracking.postalCode;
		}
		console.log(req.session.visitor.tracking);
		console.log('event.rpc args:');
		console.log(args);
		
		//get nearby events:
		eventRpc['get'].apply(function(err,results) {
			res.render('index', {
				events: results.event,
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		},[args,req,res]);

	});

	app.get('/partials/index', function(req, res) {
		var args = {};
		args.beginDate     = getBeginDate();
		args.orderByClause = 'Date'; //order by date

		if (typeof req.session.visitor.tracking.postalCode != "undefined") {
			args.nearZip = req.session.visitor.tracking.postalCode;
		}

		//get nearby events:
		eventRpc['get'].apply(function(err,results) {
			res.render('partials/index', {
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


	app.get('/style-guide', function(req, res) {
		res.render('style-guide.jade', {
			title: 'wembli.com - we got style yo!'
		});
	});

	app.get('/email/:template', function(req,res) {
		var argsMap = {
			'welcome': {

			},
			'signup' : {
				confirmLink:'#',
			},
			'rsvp': {
				rsvpDate: Date.today(),
				rsvpLink:'#',
				message: "hey man come join me at this event - it'll be a blast",
			}

		};

		return res.render('email-templates/'+req.param('template'),argsMap[req.param('template')]);

	});

};

function getBeginDate() {
	var daysPadding = 2; //how many days from today for the beginDate
	var d = Date.today();
	d2 = new Date(d);
	d2.setDate(d.getDate() + 2);
	//format the beginDate for the tn query
	return d2.format("shortDate");
}
