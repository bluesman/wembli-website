var wembliModel = require('wembli-model'),
    Customer    = wembliModel.load('customer'),
    Plan        = wembliModel.load('plan');

module.exports = function(app) {
	app.get('/rsvp/:guid?/:token?', function(req,res) {
		var guid  = req.param('guid');
		var token = req.param('token');
		console.log('rsvp to guid');
		console.log(guid);
		console.log(token);
		Plan.findOne({guid: req.param('guid')}, function(err, p) {
			if (!p) { return res.redirect('/'); };
			req.session.plan = p;

			/* who am i to this plan? */


			res.redirect('/plan');
		});
	});
};
