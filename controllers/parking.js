var sg = require('../lib/wembli/seatgeek');
var gg = require('../lib/wembli/google-geocode');
var async = require('async');
var venueRpc    = require('../rpc/venue').venue;
var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');


module.exports = function(app) {

	var viewParking = function(req,res,template,locals) {
		if (typeof req.session.plan === "undefined") {
			return res.render('no-event', {
				title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			});
		}

		/* if there already is a venue - don't need to get one */
		var args = {VenueID:req.session.plan.venue.venueId};
		venueRpc['get'].apply(function(err,results) {
			console.log(results);
			var address = results.venue[0].Street1 + ', ' + req.session.plan.event.eventCity + ', ' + req.session.plan.event.eventState;
			/* now look up the lat/long from google geocode */
			req.session.plan.venue.data = results.venue[0];
			gg.geocode(address,function(err,geocode) {
				console.log('google-geocode results');
				console.log(geocode);
				if (typeof geocode !== "undefined") {
					req.session.plan.venue.data.geocode = geocode[0];
					locals.lat = geocode[0].geometry.location.lat;
					locals.lon = geocode[0].geometry.location.lng;
				}
				res.render(template, locals);
			});
		},[args,req,res]);
	};

	app.get('/parking', function(req, res) { viewParking(req,res,'parking',{}) });
	app.get('/partials/parking', function(req, res) { viewParking(req,res,'partials/parking',{}) });
}
