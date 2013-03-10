module.exports = function(app) {
	app.get('/rsvp/:guid?/:token?', function(req,res) {
		var guid  = req.param('guid');
		var token = req.param('token');

		/* get the friend for this token */

	});
};
