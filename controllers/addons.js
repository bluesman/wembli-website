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

		var title = eventName + ' ' + addon+ '.';

		var locals = {
			'meta': {'TITLE': title},
			'jsIncludes': jsIncludes,
			'cssIncludes':[
				'/css/fixed.css'
			]
		};


		var makeDescription = function(plan) {
			return "Get the best prices on " + addon + " for " + plan.event.eventName + " at " + plan.venue.data.Name + " - " + plan.venue.data.Street1 + ', ' + plan.venue.data.ZipCode + ' on ' + plan.event.data.DisplayDate + '.';
		};

		/* check for a plan in the session */
		if (typeof req.session.plan == "undefined" || (req.session.plan.event.eventId !== eventId)) {
			var args = {
				'eventId': eventId,
				'eventName': eventName,
				'payment': 'split-after'
			};

			planRpc['startPlan'].apply(function(err, results) {
				if (!results.success) {
					console.log('sending 404');
					return res.send('404: Page not Found', 404);
				}
				console.log(results);
				locals.lat = req.session.plan.venue.data.geocode.geometry.location.lat;
				locals.lon = req.session.plan.venue.data.geocode.geometry.location.lng;

				locals.meta["DESCRIPTION"] = makeDescription(req.session.plan);

				res.render(addon,locals);
			}, [args, req, res]);
		} else {
			locals.lat = req.session.plan.venue.data.geocode.geometry.location.lat;
			locals.lon = req.session.plan.venue.data.geocode.geometry.location.lng;
			locals.meta["DESCRIPTION"] = makeDescription(req.session.plan);
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
