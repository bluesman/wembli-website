var planRpc = require('../rpc/event').event;

module.exports = function(app) {
	//if no event is defined just show the teaser telling them to search and pick an event
	/* deprecated?
	app.get('/tickets', function(req, res) {
		res.render('no-event', {
			jsIncludes:['/js/tickets.min.js'],
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
		});
	});
	*/


	app.get('/tickets/:eventId/:eventName', function(req, res) {
		/* logic:
		 * - just started a plan (split-after, no-split)
		 * - haven't started a plan and got here somehow
		 * - existing plan viewing tix to add
		 * - existing plan viewing tix added
		 */
		var locals = {
			'jsIncludes':[
				'/js/tickets.min.js'
			]
		};
		/* check for a plan in the session */
		if (typeof req.session.plan == "undefined") {
			console.log('no plan - starting one');
			var args = {
				'eventId': req.param("eventId"),
				'eventName': req.param("eventName"),
				'payment': 'split-after'
			};
			planRpc['startPlan'].apply(function(err, results) {
				console.log('started plan');
				console.log(results);

				res.render('tickets',locals);
			}, [args, req, res]);
		} else {
			console.log('existing plan');
			res.render('tickets',locals)
		}
	});

	app.get('/tickets/:eventId/:eventName/login/:ticketId', function(req, res) {
		return res.redirect('/tickets/' + req.param('eventId') + '/' + req.param('eventName') + '#tickets-login-modal-' + req.param('ticketId'));
	});

	app.get('/tickets/:eventId/:eventName', function(req, res) {
		return ticketsView(req, res, 'tickets', {
			title: 'wembli.com - Tickets, Parking, Restaurant Deals - All Here.',
			fixedHeight: true
		});
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

	app.get('/partials/modals/tickets-modals', function(req, res) {
		return res.render('partials/modals/tickets-modals');
	});

}
