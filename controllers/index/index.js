var ticketNetwork = require('../../lib/wembli/ticketnetwork');
var async = require('async');

module.exports = function(app) {

	app.get('/', function(req, res) {

		//clear the updateEvent session so searches start over
		//this session variable allows you to swap out the event for an existing plan
		delete req.session.updateEvent;

		/* redirect to account dashboard when logged in? */
		/* turning this off its confusing ...
		if (req.session.loggedIn) {
			return res.redirect((req.param('redirectUrl') ? req.param('redirectUrl') : '/dashboard'));
		}
		*/

		/*
			args holds the args for the TN GetEvent call
			args.beginDate
			args.orderByClause
			args.nearZip
		*/
		var args           = {};
		args.beginDate     = getBeginDate();
		args.orderByClause = 'Date'; //order by date

		if (typeof req.session.ipinfo != "undefined") {
			args.nearZip = req.session.ipinfo.postal_code;
		}

		//get nearby events:
		ticketNetwork.GetEvents(args, function(err, results) {

			var events = [];
			if (!err && typeof results.Event != "undefined") {
				events = results.Event.slice(0, 15);
			}

			var renderCb = function() {
					res.render('index', {
						layoutContainer: true,
						events: events,
						cssIncludes: [],
						jsIncludes: ['/js/index.js'],
						title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
						page: 'index',
					});
				};

			async.forEach(events, function(item, callback) {
				//get the ticket pricing info for this event
				ticketNetwork.GetPricingInfo({
					eventID: item.ID
				}, function(err, results) {
						if (results) {
							item.TicketPricingInfo = results;
						}
						callback();
				});
			}, renderCb);
		});
	});

	app.get('/terms-policies', function(req, res) {
		res.render('terms-policies.jade', {
			layoutContainer: true,
			cssIncludes: [],
			jsIncludes: [],
			title: 'wembli.com - Terms & Policies.'
		});

	});

	app.get('/testfb', function(req, res) {
		res.render('fbtest.jade', {
			layout: false,
		});
	});

	app.get('/layout',function(req,res) {
		res.render('fixed-width-test');
	});

	app.get('/layout-wide',function(req,res) {
		res.render('variable-width-test');
	});

	app.get('/fbchannel', function(req, res) {
		res.header('Pragma', 'public');
		res.header('Cache-Control', 'max-age=' + 2592000);
		res.header('Expires', new Date().getTime().toString());
		res.render('fbchannel.jade', {
			layout: false,
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


