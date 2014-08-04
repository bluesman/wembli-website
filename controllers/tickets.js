var planRpc = require('../rpc/plan').plan;

module.exports = function(app) {

	app.get('/tickets-off/:eventId/:eventName', function(req, res) {
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


}
