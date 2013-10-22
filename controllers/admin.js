module.exports = function(app) {
	app.get(/^\/admin\/(index)?$/, function(req, res) {
		res.render('admin/index', {});
	});
};
