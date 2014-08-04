var planRpc = require('../rpc/plan').plan;

module.exports = function(app) {

	app.get(/^\/(tickets|parking|hotels|restaurants)\/(.*)\/(.*)$/, function(req, res) {
		var addon     = req.params[0];
		var eventId   = req.params[1];
		var eventName = req.params[2];

		/* hack until tickets are completely converted to be an addon */
		var jsIncludes = [];
		if (addon === "tickets") {
			jsIncludes.push('/js/tickets.min.js');
		} else {
			jsIncludes.push('/js/add-ons.min.js');
			jsIncludes.push('//maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&libraries=places');
		}

		var locals = {
			'jsIncludes': jsIncludes,
			'cssIncludes':[
				'/css/fixed.css'
			]
		};

		/* check for a plan in the session */
		if (typeof req.session.plan == "undefined") {
			var args = {
				'eventId': eventId,
				'eventName': eventName,
				'payment': 'split-after'
			};

			planRpc['startPlan'].apply(function(err, results) {
				locals.lat = req.session.plan.venue.data.geocode.geometry.location.lat;
				locals.lon = req.session.plan.venue.data.geocode.geometry.location.lng;
				res.render(addon,locals);
			}, [args, req, res]);
		} else {
			locals.lat = req.session.plan.venue.data.geocode.geometry.location.lat;
			locals.lon = req.session.plan.venue.data.geocode.geometry.location.lng;
			res.render(addon,locals);
		}
	});

	app.get('/partials/interactive-venue-map', function(req, res) {
		/* get any purchased tickets for this plan */
		var query = {
			'planId': req.session.plan.id,
			'planGuid': req.session.plan.guid,
		};

		/* right now - you can only have 1 un-purchased ticket group..so remove any tickets that are unpurchased from the plan */

		/* find all the existing tickets for this plan */
		Ticket.find(query, function(err, tickets) {

			var ticketsPurchased = [];
			/* check if these tickets are purchased */
			async.forEach(tickets, function(item, callback) {
					if (item.purchased) {
						ticketsPurchased.push(item);
					}
					callback();
				},
				function() {
					return res.render('partials/interactive-venue-map',{ticketsPurchased:ticketsPurchased});
				});
		});
	});


}
