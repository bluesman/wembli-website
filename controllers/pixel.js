var wembliUtils = require('../lib/wembli/utils');

module.exports = function(app) {

	app.get(/^\/partials\/pixel\/(.*)\/(.*)$/, function(req, res) {
		res.render('partials/'+req.params[0]+'/'+req.params[1]+'.jade', {});
	});

};
