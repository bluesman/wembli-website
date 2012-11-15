var fs = require('fs');
var mailer = require("wembli/sendgrid");
var crypto = require('crypto');
var wembliUtils = require('wembli/utils');
var wembliModel = require('wembli-model');
var Customer = wembliModel.load('customer');
var Feed = wembliModel.load('feed');
var querystring = require('querystring');
var async = require('async');
//var https = require('https');
module.exports = function(app) {

	app.get('/dashboard/?', function(req, res) {

		//not logged in? send to login page
		if (!req.session.loggedIn) {
			res.redirect('/login', 302);
		}

		//they need to confirm their email before they can use the dashboard
		if (req.session.customer.confirmed === false) {
			//need email confirmation
			return res.render('confirm-email-sent', {
				title: 'wembli.com - check your email!.'
			});
		}

		//clear the updateEvent session so searches start over
		delete req.session.updateEvent;

		/*
			ok how does this work?
			1. get all the plans this customer is planning
			2. get all the plans this customer is invited to
			3. get the feed for all the plans this customer is involved in
		*/

		//get all the events this person is invited to
		Customer.findPlansByFriend(req.session.customer, function(err, attending) {

			//get activity feed
			var guids = [];
			for (idx in attending) {
				var p = attending[idx];
				guids.push(p.config.guid);
			}

			//pull out deleted events from the customer eventplan
			var planning = [];
			for (idx in req.session.customer.eventplan) {
				var plan = req.session.customer.eventplan[idx];
				if ((typeof plan.config != "undefined") && (typeof plan.config.deleted == "undefined" || !plan.config.deleted)) {
					planning.push(plan);
				}
				//use all guids deleted or not for activity feed
				if (typeof plan.config != "undefined") {
					guids.push(plan.config.guid);
				}
			}

			Feed.find({
				guid: {
					$in: guids
				}
			}, function(err, feeds) {
				var feed = [];
				//merge the activities from all the feeds for guids attending
				for (idx2 in feeds) {
					wembliUtils.merge(feed, feeds[idx2].activity);
				}
				//sort by feed el date_created - might be better to sort this by time
				feed.sort(function(a, b) {
					/* this is to sort by date created (iso date)
			var aDate = new Date(a.date_created);
			var aTime = aDate.getTime();
			var bDate = new Date(b.date_created);
			var bTime = bDate.getTime();
			*/
					//sort by activity.time
					var aTime = a.time;
					var bTime = b.time;
					if (aTime < bTime) {
						return 1;
					}
					if (aTime > bTime) {
						return -1;
					}
					return 0;
				});

				//only keep the last 10 feed items
				feed = feed.slice(0, 10);

				res.render('dashboard', {
					title: 'wembli.com - login to get the best seats.',
				});
			});
		});
	});
};
