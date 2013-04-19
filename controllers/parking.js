var pw = require('../lib/wembli/parkwhiz');
var sg = require('../lib/wembli/seatgeek');
var osm = require('../lib/wembli/open-street-map');
var async = require('async');
var venueRpc    = require('../rpc/venue').venue;
var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');


module.exports = function(app) {

	var viewParking = function(req,res,template,locals) {
		/* search seatgeek for the lat & lon of the venue */
		var args = {VenueID:req.session.plan.venue.venueId};
		venueRpc['get'].apply(function(err,results) {
			console.log(results);
			/* now look up the lat/long from openstreetmap */
			osm.nominatim.geocode({
				street:results.venue[0].Street1,
				city:req.session.plan.event.eventCity,
				state:req.session.plan.event.eventState,
				country:'us',
				postalcode:results.venue[0].ZipCode,
			},function(err,geocode) {
				console.log('osm results');
				console.log(geocode);
				locals.lat = geocode[0].lat;
				locals.lon = geocode[0].lon;
				res.render(template, locals);
			});
		},[args,req,res]);
	};

	app.get('/parking', function(req, res) { viewParking(req,res,'parking',{}) });
	app.get('/partials/parking', function(req, res) { viewParking(req,res,'partials/parking',{}) });
}
